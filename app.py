from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from openai import OpenAI
import logging

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False




logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
client = OpenAI(api_key="")


#add database
#and add some functons





def generate_blog_content(title, num_posts=1):
    generated_blogs = []
    try:
        for _ in range(num_posts):
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": f"Write a minimun 1000 words blog in long detail about {title}"}
                ],
            )
            generated_blog = completion.choices[0].message.content
            generated_blogs.append({"title": title, "content": generated_blog})
            if len(generated_blogs) >= 10:
                break

        for blog_entry in generated_blogs:
            new_post = BlogPost(title=blog_entry["title"], body=blog_entry["content"], is_uploaded=True)
            db.session.add(new_post)
        db.session.commit()

    except Exception as e:
        logger.error(f"Error generating content for '{title}': {str(e)}")
        return None, f"Error generating content for '{title}': {str(e)}"

    return generated_blogs, None



@app.route('/generate_blogs', methods=['POST'])
def generate_blogs():
    if request.method == 'POST':
        title = request.json.get('title', '')
        num_posts = request.json.get('num_posts', 10)
        if not title:
            return jsonify({"error": "Title is required."}), 400

        generated_blogs, error = generate_blog_content(title, num_posts)
        if error:
            return jsonify({"error": error}), 500
        
        return jsonify({"message": f"{num_posts} blog posts generated for '{title}'.", "blogs": generated_blogs}), 200

    return jsonify({"error": "Method not allowed."}), 405


@app.route('/api/blog/<int:post_id>')
def get_blog_post(post_id):
    post = BlogPost.query.get(post_id)  
    if post:
        return jsonify({"id": post.id, "title": post.title, "body": post.body})
    else:
        return jsonify({"error": "Blog post not found"}), 404


@app.route('/send-message', methods=['POST'])
def send_message():
    if request.method == "POST":
        query = request.form.get('message')
        generated_blogs, error = generate_blog_content(query) 
        if error:
            return jsonify({"error": error}), 500  

        chat_data = [{"sender": "bot", "message": blog["content"]} for blog in generated_blogs]
        return jsonify(chat_data)

    return jsonify({"error": "Method not allowed."}), 405


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
