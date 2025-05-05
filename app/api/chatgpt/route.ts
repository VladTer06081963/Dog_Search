/** @format */

export async function POST(req: Request) {
  const { breed } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Расскажи о породе собак "${breed}"` },
      ],
    }),
  });

  const data = await res.json();

  return Response.json({
    result: data.choices?.[0]?.message?.content || "Нет данных",
  });
}
