const key = "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";

async function test() {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: "Say hello" }]
    })
  });

  const data = await res.json();
  console.log(data.choices[0].message.content);
}

test();
