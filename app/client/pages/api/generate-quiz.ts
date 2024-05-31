export default async function handler(req: any, res: any) {
    if (req.method === 'POST') {
        try {
            const formData = new FormData();
            req.body.file.forEach((file: any) => formData.append('file', file));

            const apiResponse = await fetch(`${process.env.BACKEND_URL}/api/generate-quiz`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!apiResponse.ok) {
                throw new Error(`Error: ${apiResponse.statusText}`);
            }

            const data = await apiResponse.json();
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al procesar la solicitud' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}