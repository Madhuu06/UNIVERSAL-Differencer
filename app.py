from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from xml_compare import parse_xml_from_string, flatten_elements, compare_xml
from highlight_util import highlight_xml_strings

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)


# Landing page
@app.route('/')
def landing():
    return render_template('landing.html')


# Main compare page
@app.route('/compare', methods=['GET', 'POST'])
def compare_page():
    if request.method == 'POST':
        try:
            data = request.get_json()
            xml1 = data.get('xml1')
            xml2 = data.get('xml2')

            root1, error1 = parse_xml_from_string(xml1)
            root2, error2 = parse_xml_from_string(xml2)

            if error1 or error2:
                return jsonify({'error': error1 or error2}), 400

            flat1 = flatten_elements(root1)
            flat2 = flatten_elements(root2)
            diffs = compare_xml(flat1, flat2)

            left, right = highlight_xml_strings(xml1, xml2, diffs)

            # Calculate statistics
            stats = {
                'total_differences': len(diffs),
                'missing_tags': len([d for d in diffs if d['Difference Type'] == 'Tag missing']),
                'extra_tags': len([d for d in diffs if d['Difference Type'] == 'Extra tag']),
                'attribute_mismatches': len([d for d in diffs if 'Attribute' in d['Difference Type']]),
                'text_mismatches': len([d for d in diffs if d['Difference Type'] == 'Text mismatch'])
            }

            return jsonify({
                'left': left, 
                'right': right, 
                'differences': diffs,
                'statistics': stats
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
