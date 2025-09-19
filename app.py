from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import difflib
import csv
import io
import yaml
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
            'missing_items': len([d for d in diffs if d['Difference Type'] == 'Removed Line']),
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
        return jsonify({'error': str(e)}), 500


# CSV comparison endpoint
@app.route('/compare_csv', methods=['POST'])
def compare_csv():
    try:
        data = request.get_json()
        csv1_str = data.get('csv1')
        csv2_str = data.get('csv2')

        # Parse CSV
        try:
            csv1_data = parse_csv_string(csv1_str)
            csv2_data = parse_csv_string(csv2_str)
        except Exception as e:
            return jsonify({'error': f'Invalid CSV: {str(e)}'}), 400

        # Compare CSV data
        diffs = compare_csv_data(csv1_data, csv2_data)
        
        # Highlight differences in CSV strings
        left, right = highlight_csv_strings(csv1_str, csv2_str, diffs)

        # Calculate statistics
        stats = {
            'total_differences': len(diffs),
            'missing_items': len([d for d in diffs if d['Difference Type'] == 'Missing Row']),
            'extra_items': len([d for d in diffs if d['Difference Type'] == 'Extra Row']),
            'value_mismatches': len([d for d in diffs if d['Difference Type'] == 'Cell Value Mismatch'])
        }

        return jsonify({
            'left': left,
            'right': right,
            'differences': diffs,
            'statistics': stats
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# YAML comparison endpoint
@app.route('/compare_yaml', methods=['POST'])
def compare_yaml():
    try:
        data = request.get_json()
        yaml1_str = data.get('yaml1')
        yaml2_str = data.get('yaml2')

        # Parse YAML
        try:
            yaml1_data = yaml.safe_load(yaml1_str)
            yaml2_data = yaml.safe_load(yaml2_str)
        except yaml.YAMLError as e:
            return jsonify({'error': f'Invalid YAML: {str(e)}'}), 400

        # Compare YAML data (reuse JSON comparison logic)
        diffs = compare_json_objects(yaml1_data, yaml2_data)
        
        # Highlight differences in YAML strings
        left, right = highlight_yaml_strings(yaml1_str, yaml2_str, diffs)

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
    
    # Use difflib.SequenceMatcher for precise line-by-line comparison
    matcher = difflib.SequenceMatcher(None, lines1, lines2)
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            # Lines are identical, skip
            continue
        elif tag == 'delete':
            # Lines removed from file 1 (not present in file 2)
            for i in range(i1, i2):
                differences.append({
                    'Difference Type': 'Removed Line',
                    'Line Number': f'Line {i + 1}',
                    'Content': lines1[i].strip()
                })
        elif tag == 'insert':
            # Lines added to file 2 (not present in file 1)
            for j in range(j1, j2):
                differences.append({
                    'Difference Type': 'Added Line',
                    'Line Number': f'Line {j + 1}',
                    'Content': lines2[j].strip()
                })
        elif tag == 'replace':
            # Lines are different - analyze more carefully
            num_lines1 = i2 - i1
            num_lines2 = j2 - j1
            
            if num_lines1 == 1 and num_lines2 == 1:
                # Single line modification
                differences.append({
                    'Difference Type': 'Modified Line',
                    'Line Number': f'Line {i1 + 1}',
                    'Content': f'"{lines1[i1].strip()}" → "{lines2[j1].strip()}"'
                })
            else:
                # Multiple lines changed - treat as separate deletions and additions
                for i in range(i1, i2):
                    differences.append({
                        'Difference Type': 'Removed Line',
                        'Line Number': f'Line {i + 1}',
                        'Content': lines1[i].strip()
                    })
                for j in range(j1, j2):
                    differences.append({
                        'Difference Type': 'Added Line',
                        'Line Number': f'Line {j + 1}',
                        'Content': lines2[j].strip()
                    })
            
    return differences


def highlight_json_strings(json1_str, json2_str, diffs):
    """Add highlighting to JSON strings based on differences - exact line mapping"""
    try:
        # Parse and format JSON
        json1_obj = json.loads(json1_str)
        json2_obj = json.loads(json2_str)
        formatted1 = json.dumps(json1_obj, indent=2)
        formatted2 = json.dumps(json2_obj, indent=2)
        
        lines1 = formatted1.split('\n')
        lines2 = formatted2.split('\n')
        
        # Build a map of JSON paths to actual objects for precise value lookup
        def build_path_to_value_map(obj, path=""):
            """Build a map from JSON paths to their values"""
            path_map = {}
            
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    path_map[current_path] = value
                    if isinstance(value, (dict, list)):
                        path_map.update(build_path_to_value_map(value, current_path))
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    current_path = f"{path}[{i}]"
                    path_map[current_path] = item
                    if isinstance(item, (dict, list)):
                        path_map.update(build_path_to_value_map(item, current_path))
            
            return path_map
        
        # Get value maps for both JSON objects
        path_map1 = build_path_to_value_map(json1_obj)
        path_map2 = build_path_to_value_map(json2_obj)
        
        # Create sets of lines to highlight
        highlight_lines1 = set()
        highlight_lines2 = set()
        
        for diff in diffs:
            diff_type = diff['Difference Type']
            key_path = diff['Key Path']
            
            if diff_type == 'Missing':
                # Find the line in JSON1 that contains this missing value
                if key_path in path_map1:
                    value = path_map1[key_path]
                    key_name = key_path.split('.')[-1] if '.' in key_path else key_path.split('[')[0]
                    
                    # Look for the exact line that contains this key-value pair
                    target_pattern = f'"{key_name}": {json.dumps(value)}'
                    for i, line in enumerate(lines1):
                        if target_pattern in line.strip():
                            highlight_lines1.add(i)
                            break
            
            elif diff_type == 'Value mismatch':
                # Find lines in both JSON files
                if key_path in path_map1:
                    value1 = path_map1[key_path]
                    key_name = key_path.split('.')[-1] if '.' in key_path else key_path.split('[')[0]
                    
                    # Find in JSON1
                    target_pattern1 = f'"{key_name}": {json.dumps(value1)}'
                    for i, line in enumerate(lines1):
                        if target_pattern1 in line.strip():
                            highlight_lines1.add(i)
                            break
                
                if key_path in path_map2:
                    value2 = path_map2[key_path]
                    key_name = key_path.split('.')[-1] if '.' in key_path else key_path.split('[')[0]
                    
                    # Find in JSON2
                    target_pattern2 = f'"{key_name}": {json.dumps(value2)}'
                    for i, line in enumerate(lines2):
                        if target_pattern2 in line.strip():
                            highlight_lines2.add(i)
                            break
            
            elif diff_type == 'Extra':
                # Find the line in JSON2 that contains this extra value
                if key_path in path_map2:
                    value = path_map2[key_path]
                    key_name = key_path.split('.')[-1] if '.' in key_path else key_path.split('[')[0]
                    
                    target_pattern = f'"{key_name}": {json.dumps(value)}'
                    for i, line in enumerate(lines2):
                        if target_pattern in line.strip():
                            highlight_lines2.add(i)
                            break
        
        # Apply highlights
        highlighted1 = []
        for i, line in enumerate(lines1):
            if i in highlight_lines1:
                highlighted1.append(f'<span class="diff-removed">{line}</span>')
            else:
                highlighted1.append(line)
        
        highlighted2 = []
        for i, line in enumerate(lines2):
            if i in highlight_lines2:
                highlighted2.append(f'<span class="diff-modified">{line}</span>')
            else:
                highlighted2.append(line)
        
        return '\n'.join(highlighted1), '\n'.join(highlighted2)
        
    except Exception as e:
        print(f"Error in JSON highlighting: {e}")
        import traceback
        traceback.print_exc()
        return json1_str, json2_str


def highlight_text_strings(text1, text2, diffs):
    """Add highlighting to text strings based on differences - clean format without line numbers"""
    import html
    
    lines1 = text1.splitlines()
    lines2 = text2.splitlines()
    
    # Use difflib for proper alignment
    from difflib import SequenceMatcher
    matcher = SequenceMatcher(None, lines1, lines2)
    
    highlighted1 = []
    highlighted2 = []
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            # Lines are identical
            for i in range(i1, i2):
                highlighted1.append(html.escape(lines1[i]))
                highlighted2.append(html.escape(lines2[j1 + (i - i1)]))
                
        elif tag == 'delete':
            # Lines only in first file (removed)
            for i in range(i1, i2):
                highlighted1.append(f'<span class="diff-removed">{html.escape(lines1[i])}</span>')
            # Add empty lines to second file for alignment
            for _ in range(i1, i2):
                highlighted2.append('')
                
        elif tag == 'insert':
            # Lines only in second file (added)
            for j in range(j1, j2):
                highlighted2.append(f'<span class="diff-added">{html.escape(lines2[j])}</span>')
            # Add empty lines to first file for alignment
            for _ in range(j1, j2):
                highlighted1.append('')
                
        elif tag == 'replace':
            # Lines are different
            # Handle case where number of lines differ
            max_lines = max(i2 - i1, j2 - j1)
            
            for k in range(max_lines):
                if k < (i2 - i1):
                    if k < (j2 - j1):
                        # Both files have lines - show as modified
                        highlighted1.append(f'<span class="diff-modified">{html.escape(lines1[i1 + k])}</span>')
                        highlighted2.append(f'<span class="diff-modified">{html.escape(lines2[j1 + k])}</span>')
                    else:
                        # Extra line in file 1 - show as removed
                        highlighted1.append(f'<span class="diff-removed">{html.escape(lines1[i1 + k])}</span>')
                        highlighted2.append('')
                else:
                    # Extra line in file 2 - show as added
                    highlighted1.append('')
                    highlighted2.append(f'<span class="diff-added">{html.escape(lines2[j1 + k])}</span>')
    
    return '\n'.join(highlighted1), '\n'.join(highlighted2)


def parse_csv_string(csv_str):
    """Parse CSV string and return list of dictionaries"""
    csv_file = io.StringIO(csv_str.strip())
    
    # Try to detect delimiter
    sample = csv_str[:1024]
    delimiter = ','
    if '\t' in sample and sample.count('\t') > sample.count(','):
        delimiter = '\t'
    elif ';' in sample and sample.count(';') > sample.count(','):
        delimiter = ';'
    
    reader = csv.DictReader(csv_file, delimiter=delimiter)
    data = []
    for row_num, row in enumerate(reader, start=1):
        row['__row_number__'] = row_num
        data.append(row)
    
    return data


def compare_csv_data(data1, data2):
    """Compare two CSV datasets and return differences"""
    differences = []
    
    # Get headers
    headers1 = set(data1[0].keys()) - {'__row_number__'} if data1 else set()
    headers2 = set(data2[0].keys()) - {'__row_number__'} if data2 else set()
    
    # Check for missing/extra columns
    missing_cols = headers1 - headers2
    extra_cols = headers2 - headers1
    
    for col in missing_cols:
        differences.append({
            'Difference Type': 'Missing Column',
            'Column': col,
            'Details': f'Column "{col}" exists in CSV 1 but not in CSV 2'
        })
    
    for col in extra_cols:
        differences.append({
            'Difference Type': 'Extra Column',
            'Column': col,
            'Details': f'Column "{col}" exists in CSV 2 but not in CSV 1'
        })
    
    # Try content-based comparison using first column as identifier
    common_headers = headers1 & headers2
    if not common_headers:
        return differences
        
    # Use first column as primary key for matching (usually ID, Name, etc.)
    header_list = list(common_headers)
    # Try to find ID column first, otherwise use first available column
    first_col = None
    for potential_id in ['ID', 'Id', 'id', 'KEY', 'Key', 'key']:
        if potential_id in header_list:
            first_col = potential_id
            break
    
    if not first_col:
        first_col = sorted(header_list)[0]  # Use first alphabetically if no ID column
    
    # Create dictionaries for easier lookup
    data1_dict = {row[first_col]: row for row in data1}
    data2_dict = {row[first_col]: row for row in data2}
    
    all_keys = set(data1_dict.keys()) | set(data2_dict.keys())
    
    for key in all_keys:
        if key not in data1_dict:
            # Row exists only in CSV 2
            row_data = data2_dict[key]
            differences.append({
                'Difference Type': 'Extra Row',
                'Row': str(row_data['__row_number__']),
                'Key': key,
                'Details': f'Row with {first_col}="{key}" exists only in CSV 2'
            })
        elif key not in data2_dict:
            # Row exists only in CSV 1
            row_data = data1_dict[key]
            differences.append({
                'Difference Type': 'Missing Row',
                'Row': str(row_data['__row_number__']),
                'Key': key,
                'Details': f'Row with {first_col}="{key}" exists only in CSV 1'
            })
        else:
            # Row exists in both, compare cell values
            row1 = data1_dict[key]
            row2 = data2_dict[key]
            
            for header in common_headers:
                val1 = (row1.get(header) or '').strip()
                val2 = (row2.get(header) or '').strip()
                if val1 != val2:
                    differences.append({
                        'Difference Type': 'Cell Value Mismatch',
                        'Row1': str(row1['__row_number__']),
                        'Row2': str(row2['__row_number__']),
                        'Column': header,
                        'Key': key,
                        'Details': f'"{val1}" → "{val2}"'
                    })
    
    return differences


def highlight_csv_strings(csv1_str, csv2_str, diffs):
    """Add highlighting to CSV strings based on differences - highlight only specific cells"""
    lines1 = csv1_str.strip().splitlines()
    lines2 = csv2_str.strip().splitlines()
    
    # Create mapping of row IDs to differences
    missing_rows = set()  # Rows completely missing from CSV2
    added_rows = set()    # Rows completely missing from CSV1 
    modified_cells = {}   # {row_id: {column: True}}
    missing_cells = {}    # {row_id: {column: True}} - cells missing in CSV2
    
    for diff in diffs:
        diff_type = diff.get('Difference Type', '')
        
        if diff_type == 'Missing Row':
            key = diff.get('Key', '')
            missing_rows.add(key)
        elif diff_type == 'Extra Row':
            key = diff.get('Key', '')
            added_rows.add(key)
        elif diff_type == 'Cell Value Mismatch':
            key = diff.get('Key', '')
            column = diff.get('Column', '')
            
            if key not in modified_cells:
                modified_cells[key] = {}
            modified_cells[key][column] = True
    
    # Parse CSV data to identify missing cells (data present in CSV1 but not CSV2)
    try:
        import csv
        from io import StringIO
        
        csv1_data = {}
        csv2_data = {}
        
        # Parse CSV1
        reader1 = csv.DictReader(StringIO(csv1_str))
        for row in reader1:
            row_id = list(row.values())[0] if row else ""
            csv1_data[row_id] = row
        
        # Parse CSV2
        reader2 = csv.DictReader(StringIO(csv2_str))
        for row in reader2:
            row_id = list(row.values())[0] if row else ""
            csv2_data[row_id] = row
        
        # Identify missing cells (present in CSV1 but missing/empty in CSV2)
        for row_id, row1 in csv1_data.items():
            if row_id in csv2_data:
                row2 = csv2_data[row_id]
                for column, value1 in row1.items():
                    value2 = row2.get(column, "").strip()
                    value1 = value1.strip()
                    
                    # If CSV1 has data but CSV2 is empty/missing
                    if value1 and not value2:
                        if row_id not in missing_cells:
                            missing_cells[row_id] = {}
                        missing_cells[row_id][column] = True
        
    except Exception as e:
        print(f"Error parsing CSV for missing cells: {e}")
    
    # Get headers
    headers1 = [h.strip() for h in lines1[0].split(',')] if lines1 else []
    headers2 = [h.strip() for h in lines2[0].split(',')] if lines2 else []
    
    # Process CSV1 lines
    highlighted1 = []
    for i, line in enumerate(lines1):
        if i == 0:
            # Header line - no highlighting
            highlighted1.append(line)
        else:
            # Get first column value as row ID
            import csv
            from io import StringIO
            try:
                reader = csv.reader(StringIO(line))
                cells = next(reader)
                row_id = cells[0].strip() if cells else ""
            except:
                row_id = line.split(',')[0].strip().strip('"')
            
            if row_id in missing_rows:
                # Entire row missing - highlight red
                highlighted1.append(f'<span class="diff-removed">{line}</span>')
            elif row_id in modified_cells or row_id in missing_cells:
                # Some cells modified or missing - highlight specific cells
                try:
                    reader = csv.reader(StringIO(line))
                    cells = next(reader)
                    highlighted_parts = []
                    
                    for j, cell in enumerate(cells):
                        if j < len(headers1):
                            header = headers1[j]
                            
                            # Check if this specific cell is missing in CSV2
                            if row_id in missing_cells and header in missing_cells[row_id]:
                                highlighted_parts.append(f'<span class="diff-removed">{cell}</span>')
                            # Check if this specific cell is modified
                            elif row_id in modified_cells and header in modified_cells[row_id]:
                                highlighted_parts.append(f'<span class="diff-modified">{cell}</span>')
                            else:
                                highlighted_parts.append(cell)
                        else:
                            highlighted_parts.append(cell)
                    
                    # Join back with commas, preserving CSV format
                    highlighted_line = ','.join(highlighted_parts)
                    highlighted1.append(highlighted_line)
                except:
                    # Fallback to simple highlighting
                    highlighted1.append(line)
            else:
                highlighted1.append(line)
    
    # Process CSV2 lines
    highlighted2 = []
    for i, line in enumerate(lines2):
        if i == 0:
            # Header line - no highlighting
            highlighted2.append(line)
        else:
            # Get first column value as row ID
            import csv
            from io import StringIO
            try:
                reader = csv.reader(StringIO(line))
                cells = next(reader)
                row_id = cells[0].strip() if cells else ""
            except:
                row_id = line.split(',')[0].strip().strip('"')
            
            if row_id in added_rows:
                # Entire row added - highlight green
                highlighted2.append(f'<span class="diff-added">{line}</span>')
            elif row_id in modified_cells:
                # Some cells modified - highlight specific cells
                try:
                    reader = csv.reader(StringIO(line))
                    cells = next(reader)
                    highlighted_parts = []
                    
                    for j, cell in enumerate(cells):
                        if j < len(headers2) and headers2[j] in modified_cells[row_id]:
                            highlighted_parts.append(f'<span class="diff-modified">{cell}</span>')
                        else:
                            highlighted_parts.append(cell)
                    
                    # Join back with commas, preserving CSV format
                    highlighted_line = ','.join(highlighted_parts)
                    highlighted2.append(highlighted_line)
                except:
                    # Fallback to simple highlighting
                    highlighted2.append(line)
            else:
                highlighted2.append(line)
    
    return '\n'.join(highlighted1), '\n'.join(highlighted2)


def highlight_yaml_strings(yaml1_str, yaml2_str, diffs):
    """Add highlighting to YAML strings based on differences"""
    lines1 = yaml1_str.strip().splitlines()
    lines2 = yaml2_str.strip().splitlines()
    
    highlighted1 = []
    highlighted2 = []
    
    # Collect all differences with their types and paths
    diff_info = {}
    for diff in diffs:
        if 'Key Path' in diff:
            path = diff['Key Path']
            diff_type = diff['Difference Type']
            diff_info[path] = diff_type
    
    # Create sets for different types of changes
    missing_keys = set()
    extra_keys = set()  
    modified_keys = set()
    
    for path, diff_type in diff_info.items():
        final_key = path.split('.')[-1]
        if diff_type == 'Missing':
            missing_keys.add(final_key)
        elif diff_type == 'Extra':
            extra_keys.add(final_key)
        elif diff_type == 'Value mismatch':
            modified_keys.add(final_key)
    
    # Process file 1 - highlight missing (red) and modified (yellow)
    for line in lines1:
        highlighted = False
        stripped_line = line.strip()
        
        # Check for missing keys (should be red in file 1)
        for key in missing_keys:
            if f'{key}:' in stripped_line:
                highlighted1.append(f'<span class="diff-removed">{line}</span>')
                highlighted = True
                break
        
        if not highlighted:
            # Check for modified keys (should be yellow in file 1)
            for key in modified_keys:
                if f'{key}:' in stripped_line:
                    highlighted1.append(f'<span class="diff-modified">{line}</span>')
                    highlighted = True
                    break
        
        if not highlighted:
            highlighted1.append(line)
    
    # Process file 2 - highlight extra (green) and modified (yellow)
    for line in lines2:
        highlighted = False
        stripped_line = line.strip()
        
        # Check for extra keys (should be green in file 2)
        for key in extra_keys:
            if f'{key}:' in stripped_line:
                highlighted2.append(f'<span class="diff-added">{line}</span>')
                highlighted = True
                break
        
        if not highlighted:
            # Check for modified keys (should be yellow in file 2)
            for key in modified_keys:
                if f'{key}:' in stripped_line:
                    highlighted2.append(f'<span class="diff-modified">{line}</span>')
                    highlighted = True
                    break
        
        if not highlighted:
            highlighted2.append(line)
    
    return '\n'.join(highlighted1), '\n'.join(highlighted2)


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
