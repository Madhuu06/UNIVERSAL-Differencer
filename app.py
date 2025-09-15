from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import difflib
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


# JSON comparison endpoint
@app.route('/compare_json', methods=['POST'])
def compare_json():
    try:
        data = request.get_json()
        json1_str = data.get('json1')
        json2_str = data.get('json2')

        # Parse JSON
        try:
            json1 = json.loads(json1_str)
            json2 = json.loads(json2_str)
        except json.JSONDecodeError as e:
            return jsonify({'error': f'Invalid JSON: {str(e)}'}), 400

        # Compare JSON objects
        diffs = compare_json_objects(json1, json2)
        
        # Highlight differences in JSON strings
        left, right = highlight_json_strings(json1_str, json2_str, diffs)

        # Calculate statistics
        stats = {
            'total_differences': len(diffs),
            'missing_items': len([d for d in diffs if d['Difference Type'] == 'Missing']),
            'extra_items': len([d for d in diffs if d['Difference Type'] == 'Extra']),
            'value_mismatches': len([d for d in diffs if d['Difference Type'] == 'Value mismatch'])
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


# Text comparison endpoint
@app.route('/compare_text', methods=['POST'])
def compare_text():
    try:
        data = request.get_json()
        text1 = data.get('text1')
        text2 = data.get('text2')

        # Compare text line by line
        diffs = compare_text_lines(text1, text2)
        
        # Highlight differences in text
        left, right = highlight_text_strings(text1, text2, diffs)

        # Calculate statistics
        stats = {
            'total_differences': len(diffs),
            'missing_items': len([d for d in diffs if d['Difference Type'] == 'Missing Line']),
            'extra_items': len([d for d in diffs if d['Difference Type'] == 'Added Line']),
            'value_mismatches': len([d for d in diffs if d['Difference Type'] == 'Modified Line'])
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


def compare_json_objects(obj1, obj2, path=""):
    """Compare two JSON objects and return list of differences"""
    differences = []
    
    def compare_values(val1, val2, current_path):
        if type(val1) != type(val2):
            differences.append({
                'Difference Type': 'Type mismatch',
                'Key Path': current_path,
                'Property': f'{type(val1).__name__} vs {type(val2).__name__}'
            })
            return
            
        if isinstance(val1, dict) and isinstance(val2, dict):
            all_keys = set(val1.keys()) | set(val2.keys())
            for key in all_keys:
                key_path = f"{current_path}.{key}" if current_path else key
                if key not in val1:
                    differences.append({
                        'Difference Type': 'Extra',
                        'Key Path': key_path,
                        'Property': str(val2[key])
                    })
                elif key not in val2:
                    differences.append({
                        'Difference Type': 'Missing',
                        'Key Path': key_path,
                        'Property': str(val1[key])
                    })
                else:
                    compare_values(val1[key], val2[key], key_path)
                    
        elif isinstance(val1, list) and isinstance(val2, list):
            max_len = max(len(val1), len(val2))
            for i in range(max_len):
                item_path = f"{current_path}[{i}]"
                if i >= len(val1):
                    differences.append({
                        'Difference Type': 'Extra',
                        'Key Path': item_path,
                        'Property': str(val2[i])
                    })
                elif i >= len(val2):
                    differences.append({
                        'Difference Type': 'Missing',
                        'Key Path': item_path,
                        'Property': str(val1[i])
                    })
                else:
                    compare_values(val1[i], val2[i], item_path)
        else:
            if val1 != val2:
                differences.append({
                    'Difference Type': 'Value mismatch',
                    'Key Path': current_path,
                    'Property': f'{val1} -> {val2}'
                })
    
    compare_values(obj1, obj2, path)
    return differences


def compare_text_lines(text1, text2):
    """Compare two text strings line by line and return differences"""
    lines1 = text1.splitlines()
    lines2 = text2.splitlines()
    
    differences = []
    
    # Use difflib.SequenceMatcher for better line-by-line comparison
    matcher = difflib.SequenceMatcher(None, lines1, lines2)
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            # Lines are identical, skip
            continue
        elif tag == 'delete':
            # Lines only in file 1 (missing from file 2)
            for i in range(i1, i2):
                differences.append({
                    'Difference Type': 'Missing Line',
                    'Line Number': str(i + 1),
                    'Content': lines1[i]
                })
        elif tag == 'insert':
            # Lines only in file 2 (added to file 2)
            for j in range(j1, j2):
                differences.append({
                    'Difference Type': 'Added Line',
                    'Line Number': str(j + 1),
                    'Content': lines2[j]
                })
        elif tag == 'replace':
            # Lines are different - treat as modified lines
            # If same number of lines changed, treat as modifications
            if (i2 - i1) == (j2 - j1):
                for i, j in zip(range(i1, i2), range(j1, j2)):
                    differences.append({
                        'Difference Type': 'Modified Line',
                        'Line Number': str(i + 1),
                        'Content': f"'{lines1[i]}' → '{lines2[j]}'"
                    })
            else:
                # Different number of lines, treat as separate delete/insert
                for i in range(i1, i2):
                    differences.append({
                        'Difference Type': 'Missing Line',
                        'Line Number': str(i + 1),
                        'Content': lines1[i]
                    })
                for j in range(j1, j2):
                    differences.append({
                        'Difference Type': 'Added Line',
                        'Line Number': str(j + 1),
                        'Content': lines2[j]
                    })
            
    return differences


def highlight_json_strings(json1_str, json2_str, diffs):
    """Add highlighting to JSON strings based on differences"""
    try:
        # Parse and format JSON
        json1_obj = json.loads(json1_str)
        json2_obj = json.loads(json2_str)
        formatted1 = json.dumps(json1_obj, indent=2)
        formatted2 = json.dumps(json2_obj, indent=2)
        
        # Create highlighted versions similar to XML
        lines1 = formatted1.split('\n')
        lines2 = formatted2.split('\n')
        
        highlighted1 = []
        highlighted2 = []
        
        # Create a mapping of paths to line numbers for highlighting
        diff_paths = {diff['Key Path'] for diff in diffs}
        
        # Simple highlighting - mark lines that contain paths mentioned in diffs
        for i, line in enumerate(lines1):
            line_highlighted = line
            for path in diff_paths:
                # Simple check if the line contains a key from the diff path
                key_parts = path.split('.')
                for key_part in key_parts:
                    clean_key = key_part.split('[')[0]  # Remove array indices
                    if f'"{clean_key}"' in line:
                        diff_type = next((d['Difference Type'] for d in diffs if d['Key Path'] == path), 'Unknown')
                        if diff_type == 'Missing':
                            line_highlighted = f'<span class="highlight-remove">{line}</span>'
                        elif diff_type == 'Extra':
                            line_highlighted = f'<span class="highlight-add">{line}</span>'
                        else:
                            line_highlighted = f'<span class="highlight-mismatch">{line}</span>'
                        break
                if line_highlighted != line:
                    break
            highlighted1.append(line_highlighted)
        
        for i, line in enumerate(lines2):
            line_highlighted = line
            for path in diff_paths:
                key_parts = path.split('.')
                for key_part in key_parts:
                    clean_key = key_part.split('[')[0]
                    if f'"{clean_key}"' in line:
                        diff_type = next((d['Difference Type'] for d in diffs if d['Key Path'] == path), 'Unknown')
                        if diff_type == 'Missing':
                            line_highlighted = f'<span class="highlight-add">{line}</span>'
                        elif diff_type == 'Extra':
                            line_highlighted = f'<span class="highlight-remove">{line}</span>'
                        else:
                            line_highlighted = f'<span class="highlight-mismatch">{line}</span>'
                        break
                if line_highlighted != line:
                    break
            highlighted2.append(line_highlighted)
        
        return '\n'.join(highlighted1), '\n'.join(highlighted2)
        
    except:
        return json1_str, json2_str


def highlight_text_strings(text1, text2, diffs):
    """Add highlighting to text strings based on differences"""
    lines1 = text1.splitlines()
    lines2 = text2.splitlines()
    
    # Create highlighted versions
    highlighted1 = []
    highlighted2 = []
    
    # Use difflib to get detailed line-by-line differences
    matcher = difflib.SequenceMatcher(None, lines1, lines2)
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            # Lines are the same
            for i in range(i1, i2):
                highlighted1.append(f'<span class="line-number">{i+1:3d}</span> {lines1[i]}')
            for j in range(j1, j2):
                highlighted2.append(f'<span class="line-number">{j+1:3d}</span> {lines2[j]}')
        elif tag == 'delete':
            # Lines only in file 1 (missing from file 2)
            for i in range(i1, i2):
                highlighted1.append(f'<span class="line-number">{i+1:3d}</span> <span class="diff-removed">{lines1[i]}</span>')
        elif tag == 'insert':
            # Lines only in file 2 (added to file 2)
            for j in range(j1, j2):
                highlighted2.append(f'<span class="line-number">{j+1:3d}</span> <span class="diff-added">{lines2[j]}</span>')
        elif tag == 'replace':
            # Lines are different
            for i in range(i1, i2):
                highlighted1.append(f'<span class="line-number">{i+1:3d}</span> <span class="diff-removed">{lines1[i]}</span>')
            for j in range(j1, j2):
                highlighted2.append(f'<span class="line-number">{j+1:3d}</span> <span class="diff-added">{lines2[j]}</span>')
    
    return '\n'.join(highlighted1), '\n'.join(highlighted2)


if __name__ == '__main__':
    app.run(debug=True)
