from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from io import BytesIO
import openai
import os
import json

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/api/hello', methods=['GET'])
def hello_world():
    return jsonify({'message': 'Hello World'})

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    file = request.files['file']
    print(file)
    if not file:
        return jsonify({'error': 'No file provided'}), 400

    # Read the PDF from memory
    try:
        # Create a BytesIO object from the uploaded file content
        pdf_memory = BytesIO(file.read())

        # Initialize PDF Reader with the memory object
        reader = PdfReader(pdf_memory)
        full_text = ""

        # Extract text from each page of the PDF
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Construct a structured prompt for OpenAI
    structured_prompt = """
    Generate 10 insightful questions based on the following text. For each question, provide 4 multiple-choice options and indicate the correct answer. 
    Please format each question as a JSON object within a list, with 'question', 'options' (a list of choices), and 'answer' (the correct choice) keys.
    Provide the response in Spanish.
    """

    # Use OpenAI to generate questions and answers using the chat endpoint
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-1106",
        messages=[
            {"role": "system", "content": structured_prompt},
            {"role": "user", "content": full_text}
        ],
        max_tokens=3000,
        temperature=0.5
    )

    # Extract the response content from the OpenAI response
    response_content = response.choices[0].message['content']
    response_content_json_string = response_content.strip()[7:-3].strip()

    # Parse the response into a structured JSON format
    try:
        structured_response = json.loads(response_content_json_string)
    except json.JSONDecodeError:
        return jsonify({'error': 'Failed to parse the response into JSON format'}), 500

    # Return the structured content
    return jsonify({'questions_and_answers': structured_response})

if __name__ == '__main__':
    app.run(debug=True)