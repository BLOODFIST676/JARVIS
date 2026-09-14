export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },

                body: JSON.stringify({
                    model: "gpt-5-mini",
                    input: [
                        {
                            role: "system",
                            content:
                                "You are JARVIS, a helpful personal AI assistant. Be concise, intelligent, polite and useful. You are assisting a secondary school student."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            return res.status(response.status).json({
                error: "AI request failed"
            });
        }

        const answer =
            data.output_text ||
            "JARVIS: I was unable to generate a response.";

        return res.status(200).json({
            response: answer
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Something went wrong."
        });
    }
}
