export default async function handler(req: any, res: any) {
    if (req.method === 'GET') {
        try {
            // Llamada al endpoint del backend para obtener los PDFs
            const apiResponse = await fetch(`${process.env.BACKEND_URL}/api/documents`, {
                method: 'GET'
            });

            if (!apiResponse.ok) {
                throw new Error(`Error: ${apiResponse.statusText}`);
            }

            const pdfs = await apiResponse.json();
            res.status(200).json(pdfs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al recuperar los PDFs' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
