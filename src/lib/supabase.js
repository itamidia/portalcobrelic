import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Helper para fazer queries com tratamento de erro
export async function query(table, options = {}) {
  try {
    let query = supabase.from(table).select(options.select || '*')
    
    if (options.eq) {
      const [column, value] = options.eq
      query = query.eq(column, value)
    }
    
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }
    
    if (options.order) {
      const { column, ascending = true } = options.order
      query = query.order(column, { ascending })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    if (options.single) {
      query = query.single()
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return options.single ? data : (data || [])
  } catch (error) {
    console.error(`Error querying ${table}:`, error)
    throw error
  }
}

// Helper para criar registro
export async function create(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  } catch (error) {
    console.error(`Error creating ${table}:`, error)
    throw error
  }
}

// Helper para atualizar
export async function update(table, id, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  } catch (error) {
    console.error(`Error updating ${table}:`, error)
    throw error
  }
}

// Helper para deletar
export async function remove(table, id) {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error(`Error deleting ${table}:`, error)
    throw error
  }
}

// Auth helpers
export const auth = {
  signUp: (email, password, metadata = {}) => 
    supabase.auth.signUp({ email, password, options: { data: metadata } }),
  
  signIn: (email, password) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  signInWithOAuth: (provider) => 
    supabase.auth.signInWithOAuth({ provider }),
  
  signOut: () => supabase.auth.signOut(),
  
  getUser: () => supabase.auth.getUser(),
  
  getSession: () => supabase.auth.getSession(),
  
  onAuthStateChange: (callback) => 
    supabase.auth.onAuthStateChange(callback),
    
  resetPassword: (email) => 
    supabase.auth.resetPasswordForEmail(email),
    
  updateUser: (data) => 
    supabase.auth.updateUser(data)
}

// Storage helpers
export const storage = {
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    if (error) throw error
    return data
  },
  
  getUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },
  
  remove: async (bucket, paths) => {
    const { error } = await supabase.storage.from(bucket).remove(paths)
    if (error) throw error
    return true
  }
}

// Functions helper
export async function invokeFunction(name, payload) {
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body: payload
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error invoking function ${name}:`, error)
    throw error
  }
}
