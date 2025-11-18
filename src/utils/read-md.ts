'use server'

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

export const readMarkdownFile = async (filePath: string): Promise<string> => {
  try {
    const fullPath = path.join(CONTENT_DIR, filePath)
    const data = await fs.readFile(fullPath, 'utf-8')
    return data
  }
  catch (error) {
    throw new Error(`Error reading markdown file at ${filePath}: ${(error as Error).message}`)
  }
}
