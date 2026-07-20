import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import dotenv from 'dotenv'

dotenv.config({ path: 'apps/web/.env' })

async function run() {
  console.log("Testing gemini...")
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY',
    })

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages: [{ role: 'user', content: 'hola' }],
    })

    let text = ''
    for await (const chunk of result.textStream) {
      text += chunk
      process.stdout.write(chunk)
    }
    console.log('\n\nDone!')
  } catch (err) {
    console.error('Error:', err)
  }
}

run()
