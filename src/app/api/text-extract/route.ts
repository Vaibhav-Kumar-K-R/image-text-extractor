import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            )
        }

        const formData = await request.formData()
        const imageFile = formData.get('image') as File

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            )
        }

        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const imagePart = {
            inlineData: {
                data: buffer.toString('base64'),
                mimeType: imageFile.type,
            },
        }

        const prompt = `Please do  extract all the text from this image. Return only the text content without any additional formatting or explanations. If there's no readable text in the image,then please respond with "No text found in the image."`

        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        const extractedText = response.text()

        return NextResponse.json({ text: extractedText })
    } catch (error) {
        console.error('Error extracting text:', error)
        return NextResponse.json(
            { error: 'Failed to extract text from the given  image' },
            { status: 500 }
        )
    }
}