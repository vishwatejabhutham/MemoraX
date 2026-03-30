import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, category, phase } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";

    if (phase === "chat") {
      systemPrompt = `You are Memora AI, a premium event planning assistant for MemoraX. You help users plan memorable ${category || "events"}.

Your role during the chat phase:
- Ask ONE question at a time to gather information for planning the event
- Questions should cover: budget, guest count, preferred location/city, special themes or expectations, date preferences, and any specific requirements
- Be warm, enthusiastic, and professional
- Use emojis sparingly but effectively
- After gathering enough information (typically 4-5 questions), tell the user you have everything needed and will now generate their personalized plan
- When you have enough info, end your message with exactly: [READY_TO_PLAN]
- Keep responses concise (2-3 sentences max per message)`;
    } else if (phase === "plan") {
      systemPrompt = `You are Memora AI, a premium event planning assistant. Based on the conversation, generate a detailed event plan.

Return your response in this EXACT JSON format (no markdown, just raw JSON):
{
  "sections": [
    {
      "title": "🎨 Event Design",
      "items": ["item1", "item2", "item3"]
    },
    {
      "title": "💰 Budget Breakdown",
      "items": ["Venue & Setup: ₹XX,XXX", "Catering (N guests): ₹XX,XXX", "Decor & Flowers: ₹XX,XXX", "Entertainment: ₹XX,XXX"]
    },
    {
      "title": "📅 Timeline",
      "items": ["T-30 days: ...", "T-15 days: ...", "T-7 days: ...", "Event Day: ..."]
    },
    {
      "title": "🎯 Vendor Recommendations",
      "items": ["vendor1", "vendor2", "vendor3"]
    }
  ],
  "totalCost": "₹X,XX,XXX",
  "savings": "₹XX,XXX"
}

Make the plan realistic based on the user's inputs. Budget items should be realistic Indian Rupee amounts.`;
    } else if (phase === "refine") {
      systemPrompt = `You are Memora AI. The user wants to modify their event plan. Help them refine it.
Respond conversationally. If they ask for specific changes, acknowledge and explain how the plan would be updated.
Keep responses concise and helpful.`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: phase !== "plan",
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (phase === "plan") {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("event-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
