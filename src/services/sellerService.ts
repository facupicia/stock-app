import { supabase } from '../lib/supabase';
import { Seller, SellerLink, SellerFormData } from '../types/Seller';

export class SellerService {
  // Obtener todos los sellers con sus links
  static async getAll(): Promise<Seller[]> {
    const { data, error } = await supabase
      .from('sellers')
      .select(`
        *,
        links:seller_links(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sellers:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener seller por ID con sus links
  static async getById(id: string): Promise<Seller | null> {
    const { data, error } = await supabase
      .from('sellers')
      .select(`
        *,
        links:seller_links(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching seller:', error);
      throw error;
    }

    return data;
  }

  // Crear nuevo seller con links
  static async create(sellerData: SellerFormData): Promise<Seller> {
    // Crear el seller
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .insert([{
        name: sellerData.name,
        specialty: sellerData.specialty,
        description: sellerData.description
      }])
      .select()
      .single();

    if (sellerError) {
      console.error('Error creating seller:', sellerError);
      throw sellerError;
    }

    // Crear los links si existen
    if (sellerData.links && sellerData.links.length > 0) {
      const linksToInsert = sellerData.links
        .filter(link => link.name.trim() && link.url.trim())
        .map(link => ({
          seller_id: seller.id,
          name: link.name.trim(),
          url: link.url.trim()
        }));

      if (linksToInsert.length > 0) {
        const { error: linksError } = await supabase
          .from('seller_links')
          .insert(linksToInsert);

        if (linksError) {
          console.error('Error creating seller links:', linksError);
          throw linksError;
        }
      }
    }

    // Retornar el seller completo con links
    return this.getById(seller.id) as Promise<Seller>;
  }

  // Actualizar seller
  static async update(id: string, sellerData: SellerFormData): Promise<Seller> {
    // Actualizar el seller
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .update({
        name: sellerData.name,
        specialty: sellerData.specialty,
        description: sellerData.description
      })
      .eq('id', id)
      .select()
      .single();

    if (sellerError) {
      console.error('Error updating seller:', sellerError);
      throw sellerError;
    }

    // Eliminar links existentes
    const { error: deleteLinksError } = await supabase
      .from('seller_links')
      .delete()
      .eq('seller_id', id);

    if (deleteLinksError) {
      console.error('Error deleting existing links:', deleteLinksError);
      throw deleteLinksError;
    }

    // Crear nuevos links
    if (sellerData.links && sellerData.links.length > 0) {
      const linksToInsert = sellerData.links
        .filter(link => link.name.trim() && link.url.trim())
        .map(link => ({
          seller_id: id,
          name: link.name.trim(),
          url: link.url.trim()
        }));

      if (linksToInsert.length > 0) {
        const { error: linksError } = await supabase
          .from('seller_links')
          .insert(linksToInsert);

        if (linksError) {
          console.error('Error creating new links:', linksError);
          throw linksError;
        }
      }
    }

    // Retornar el seller completo con links
    return this.getById(id) as Promise<Seller>;
  }

  // Eliminar seller
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sellers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting seller:', error);
      throw error;
    }
  }

  // Buscar sellers por especialidad
  static async getBySpecialty(specialty: string): Promise<Seller[]> {
    const { data, error } = await supabase
      .from('sellers')
      .select(`
        *,
        links:seller_links(*)
      `)
      .eq('specialty', specialty)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sellers by specialty:', error);
      throw error;
    }

    return data || [];
  }

  // Buscar sellers por nombre
  static async search(searchTerm: string): Promise<Seller[]> {
    const { data, error } = await supabase
      .from('sellers')
      .select(`
        *,
        links:seller_links(*)
      `)
      .or(`name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching sellers:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener todas las especialidades únicas
  static async getSpecialties(): Promise<string[]> {
    const { data, error } = await supabase
      .from('sellers')
      .select('specialty')
      .order('specialty');

    if (error) {
      console.error('Error fetching specialties:', error);
      throw error;
    }

    const specialties = [...new Set(data?.map(item => item.specialty) || [])];
    return specialties;
  }
}