import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// inventory-management-app/src/app/api/generate/route.js

export const POST = async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const data = await req.json()
        const prompt = data.body

        const result = await model.generateContent(prompt)
        const response  = await result.response
        const output = await response.text()

        return NextResponse.json({ output: output })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}