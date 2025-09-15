import html
import re

def highlight_xml_strings(xml1, xml2, diffs):
    """
    Balanced highlighting that works correctly for multiple occurrences
    """
    def escape_html(text):
        return html.escape(text)
    
    def apply_precise_highlights(xml_content, diff_list, content_type):
        # Escape HTML first
        highlighted = escape_html(xml_content)
        
        # Create a list of all unique modifications we need to make
        modifications = []
        
        for diff in diff_list:
            diff_type = diff['Difference Type']
            tag_path = diff['Tag Path']
            attribute = diff['Attribute']
            
            # Skip root level differences
            if tag_path.count('/') <= 1:
                continue
                
            # Extract tag name and index from path
            path_parts = [p for p in tag_path.strip('/').split('/') if p]
            if not path_parts:
                continue
                
            last_part = path_parts[-1]
            tag_name = re.sub(r'\[\d+\]', '', last_part)
            
            # Extract the index number if present (e.g., "skill[1]" -> 1)
            index_match = re.search(r'\[(\d+)\]', last_part)
            tag_index = int(index_match.group(1)) if index_match else 1
            
            if not tag_name or tag_name.lower() in ['root', 'document']:
                continue
                
            # Add to modifications list
            modifications.append({
                'type': diff_type,
                'tag': tag_name,
                'index': tag_index,
                'attribute': attribute,
                'content_type': content_type
            })
        
        # Apply modifications using index-aware approach
        for mod in modifications:
            if mod['type'] == "Text mismatch":
                highlighted = highlight_nth_occurrence(highlighted, mod['tag'], mod['index'], "highlight-mismatch")
                
            elif mod['type'] == "Attribute mismatch":
                highlighted = highlight_nth_attribute(highlighted, mod['tag'], mod['attribute'], mod['index'], "highlight-mismatch")
                
            elif mod['type'] == "Tag missing" and mod['content_type'] == "left":
                highlighted = highlight_nth_tag(highlighted, mod['tag'], mod['index'], "highlight-remove")
                
            elif mod['type'] == "Extra tag" and mod['content_type'] == "right":
                highlighted = highlight_nth_tag(highlighted, mod['tag'], mod['index'], "highlight-add")
        
        return highlighted
    
    def highlight_nth_occurrence(xml_content, tag_name, occurrence_num, css_class):
        """Highlight the Nth occurrence of a tag's text content"""
        pattern = f'(&lt;{re.escape(tag_name)}&gt;)([^&<]*?)(&lt;/{re.escape(tag_name)}&gt;)'
        
        count = 0
        def replace_nth(match):
            nonlocal count
            count += 1
            if count == occurrence_num:
                opening = match.group(1)
                content = match.group(2)
                closing = match.group(3)
                return f'{opening}<span class="{css_class}">{content}</span>{closing}'
            return match.group(0)
        
        return re.sub(pattern, replace_nth, xml_content)
    
    def highlight_nth_attribute(xml_content, tag_name, attr_name, occurrence_num, css_class):
        """Highlight attribute in the Nth occurrence of a tag"""
        if attr_name == "(text)" or attr_name == "-":
            return xml_content
            
        # Find the Nth tag occurrence first
        tag_pattern = f'&lt;{re.escape(tag_name)}[^>]*?&gt;'
        tag_matches = list(re.finditer(tag_pattern, xml_content))
        
        if occurrence_num <= len(tag_matches):
            target_match = tag_matches[occurrence_num - 1]
            tag_content = target_match.group(0)
            
            # Highlight the attribute within this specific tag
            attr_pattern = f'({re.escape(attr_name)}=")([^"]*?)(")'
            highlighted_tag = re.sub(attr_pattern, f'\\1<span class="{css_class}">\\2</span>\\3', tag_content)
            
            # Replace the original tag with the highlighted version
            xml_content = xml_content[:target_match.start()] + highlighted_tag + xml_content[target_match.end():]
        
        return xml_content
    
    def highlight_nth_tag(xml_content, tag_name, occurrence_num, css_class):
        """Highlight the Nth occurrence of an entire tag"""
        pattern = f'(&lt;{re.escape(tag_name)}&gt;[^&]*?&lt;/{re.escape(tag_name)}&gt;)'
        
        count = 0
        def replace_nth(match):
            nonlocal count
            count += 1
            if count == occurrence_num:
                return f'<span class="{css_class}">{match.group(1)}</span>'
            return match.group(0)
        
        return re.sub(pattern, replace_nth, xml_content)

    # Process both XML strings
    highlighted_left = apply_precise_highlights(xml1, diffs, "left")
    highlighted_right = apply_precise_highlights(xml2, diffs, "right")
    
    return highlighted_left, highlighted_right
    highlighted_right = apply_highlights(xml2, diffs, "right")
    
    return highlighted_left, highlighted_right
