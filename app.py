from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
import json

app = Flask(__name__)

# --- CẤU HÌNH API KEY (DÙNG THƯ VIỆN CŨ) ---
API_KEY = "AIzaSy..." # Thay key của bạn vào đây
genai.configure(api_key=API_KEY)

# Cấu hình model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", # Bản cũ dùng 1.5 ổn định hơn
    generation_config=generation_config,
)

@app.route('/')
def index():
    return render_template('index.html')

# API: Tạo bài học
@app.route('/api/lesson', methods=['POST'])
def generate_lesson():
    topic = request.json.get('topic')
    prompt = f'Create a cybersecurity lesson about "{topic}" in Vietnamese. Structure: title, sections (heading, content). Return JSON.'
    
    # Schema cho bản cũ
    schema_prompt = """
    Follow this JSON schema:
    {
        "title": "string",
        "sections": [{"heading": "string", "content": "string"}]
    }
    """
    
    try:
        response = model.generate_content(prompt + schema_prompt)
        return jsonify(json.loads(response.text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API: Tạo câu hỏi
@app.route('/api/quiz', methods=['POST'])
def generate_quiz():
    topic = request.json.get('topic')
    prompt = f'Create 5 multiple choice questions about "{topic}" in Vietnamese. Include correctIndex (0-3) and explanation. Return JSON.'
    
    schema_prompt = """
    Follow this JSON schema:
    {
        "title": "string",
        "questions": [{
            "text": "string", 
            "options": ["string", "string", "string", "string"], 
            "correctIndex": integer, 
            "explanation": "string"
        }]
    }
    """
    
    try:
        response = model.generate_content(prompt + schema_prompt)
        return jsonify(json.loads(response.text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API: Quét code
@app.route('/api/check', methods=['POST'])
def analyze_code():
    code_input = request.json.get('input')
    prompt = f'Analyze security vulnerabilities for this input in Vietnamese: "{code_input}". Return JSON.'
    
    schema_prompt = """
    Follow this JSON schema:
    {
        "riskLevel": "CRITICAL|HIGH|MEDIUM|LOW|SAFE",
        "score": integer,
        "summary": "string",
        "findings": [{"severity": "HIGH|MEDIUM|LOW", "description": "string", "recommendation": "string"}]
    }
    """
    
    try:
        response = model.generate_content(prompt + schema_prompt)
        return jsonify(json.loads(response.text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)