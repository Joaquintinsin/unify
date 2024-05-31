import { useState, ChangeEvent, FormEvent, useEffect } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/documents')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setDocuments(data);
        }
      })
      .catch(err => {
        console.error('Error al cargar los documentos:', err);
        setError('Error al cargar los documentos');
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setUploadedFileName(data.path);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  return (
    <div className='h-full w-full bg-gray-100 min-h-screen py-8'>
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-bold text-gray-700" htmlFor="file">
            Cargar Archivo PDF en UNIFY (el Software Revolucionario de la UNRC :)
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={!file || loading}
          >
            {loading ? 'Cargando...' : 'Subir Documento'}
          </button>
        </form>
        {loading && <div className="mx-auto loader">Cargando...</div>}
        {!loading && uploadedFileName && (
          <p className="mt-4 text-green-500">
            Documento subido con éxito: {uploadedFileName}
          </p>
        )}

        {documents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold">Documentos subidos</h2>
            <ul>
              {documents.map((document: any) => (
                <li key={document.id} className="mt-2">
                  <a href={document.title} target="_blank" rel="noreferrer">
                    {document.file_path}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}