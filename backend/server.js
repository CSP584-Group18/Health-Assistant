const express = require("express");
const cors = require("cors");
const axios = require("axios");
const connectDB = require("./config/db");
const Ticket = require("./models/Ticket");
require("dotenv").config();

const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/medicines", require("./routes/medicines"));
app.use("/api/conversations", require("./routes/conversations"));
app.use("/api/symptoms", require("./routes/symptoms"));
app.use("/api/cart", require("./routes/cartItem"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/clear", require("./routes/clearCart"));

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "http://localhost:5005/webhooks/rest/webhook",
      {
        sender: "user1",
        message: userMessage,
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error communicating with chatbot");
  }
});

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/api/tickets", upload.single("ticketImage"), async (req, res) => {
  const ticketNumber = `Ticket${Date.now()}`;
  const description = req.body.description;
  const imageUrl = req.file ? req.file.path : null;

  if (!description) {
    return res.status(400).json({ message: "Description is required" });
  }

  try {
    const newTicket = new Ticket({
      ticket_number: ticketNumber,
      description: description,
      image_url: imageUrl,
    });

    await newTicket.save();

    res
      .status(201)
      .json({
        message: "Ticket saved successfully",
        ticketNumber: ticketNumber,
      });
  } catch (error) {
    console.error("Error saving ticket data:", error);
    res.status(500).json({ message: "Error saving ticket data", error: error });
  }
});

app.get("/api/tickets/analyze/:ticketNumber", async (req, res) => {
  try {
    const ticketNumber = req.params.ticketNumber;
    const ticket = await Ticket.findOne({ ticket_number: ticketNumber });

    if (!ticket) {
      return res
        .status(404)
        .json({
          message: "Ticket not found. Please check your ticket number.",
        });
    }

    const { description, image_url } = ticket;

    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
                            You are a customer service assistant for a pharmacy's online web app. Based on the ticket description and image, decide if the customer is eligible for one of the following outcomes:
                            - **Refund Medication**: If the customer received incorrect medication or has a valid reason for returning the medication.
                            - **Replace Medication**: If the customer received the wrong dosage, packaging, or expired medication.
                            - **Provide Consultation**: If the customer has questions about their prescription or medication and requires further clarification.
                            - **Escalate to Human Agent**: If the issue cannot be resolved automatically, such as complex prescription errors or disputes.

                            **Respond with the decision and a brief reason in one sentence**.
                        `,
          },
          {
            role: "user",
            content: `Ticket description: ${description}\nTicket image URL: ${image_url}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const decision = gptResponse.data.choices[0].message.content.trim();

    ticket.decision = decision;
    await ticket.save();

    res.status(200).json({
      message: "Ticket analyzed successfully",
      ticketNumber: ticketNumber,
      decision: decision,
    });
  } catch (error) {
    console.error("Error with OpenAI API call:", error);
    res.status(500).json({
      message: "Error analyzing the ticket",
      error: error.response ? error.response.data : error.message,
    });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
