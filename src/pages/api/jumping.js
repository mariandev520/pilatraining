// pages/api/camas-pilates.js
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  // Configura CORS para producción
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Access-Control-Allow-Origin', 'https://evolutionui.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  }

  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    
    if (req.method === 'GET') {
      const result = await db.collection('jumping').findOne({ tipo: 'asignacionesCamas' });
      return res.status(200).json(result?.data || {});
    }

    if (req.method === 'POST') {
      const { asignaciones } = req.body;
      await db.collection('jumping').updateOne(
        { tipo: 'asignacionesCamas' },
        { $set: { data: asignaciones, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}