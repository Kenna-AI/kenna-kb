import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Section = {
  id: string
  title: string
  subtitle: string
  sort_order: number
}

export type Tool = {
  id: string
  section_id: string
  name: string
  slug: string
  icon: string
  tagline: string
  steps: string[]
  tips: string[]
  notes: string[]
  published: boolean
  sort_order: number
  updated_at: string
}

export async function getSections(): Promise<Section[]> {
  const { data } = await supabase
    .from('kb_sections')
    .select('*')
    .order('sort_order')
  return data || []
}

export async function getTools(): Promise<Tool[]> {
  const { data } = await supabase
    .from('kb_tools')
    .select('*')
    .eq('published', true)
    .order('sort_order')
  return data || []
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const { data } = await supabase
    .from('kb_tools')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

export async function getAllToolsAdmin(): Promise<Tool[]> {
  const { data } = await supabase
    .from('kb_tools')
    .select('*')
    .order('section_id, sort_order')
  return data || []
}
