import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from app.schemas import ChordSheet, SongInfo


class PDFGenerator:
    """Service for generating chord sheet PDFs"""
    
    def __init__(self):
        self.temp_dir = os.getenv("TEMP_DIR", "./temp")
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def generate_chord_sheet(
        self, 
        chord_sheet: ChordSheet,
        output_path: str,
        transpose: int = 0
    ) -> str:
        """Generate a PDF chord sheet"""
        
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#1DB954'),  # Spotify green
            spaceAfter=6
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.grey,
            spaceAfter=12
        )
        
        chord_style = ParagraphStyle(
            'ChordStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#0066CC'),
            fontName='Courier-Bold',
            spaceAfter=2
        )
        
        lyrics_style = ParagraphStyle(
            'LyricsStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=10,
            leading=14
        )
        
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=colors.HexColor('#FF6B6B'),
            spaceAfter=8,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph(chord_sheet.song_info.title, title_style))
        
        # Artist
        story.append(Paragraph(chord_sheet.song_info.artist, subtitle_style))
        
        # Song info table
        info_data = [
            ['Key:', chord_sheet.key, 'Tempo:', f"{chord_sheet.tempo} BPM"],
        ]
        
        if chord_sheet.capo:
            info_data.append(['Capo:', f"Fret {chord_sheet.capo}", '', ''])
        
        if transpose != 0:
            direction = "up" if transpose > 0 else "down"
            info_data.append(['Transposed:', f"{abs(transpose)} semitones {direction}", '', ''])
        
        info_table = Table(info_data, colWidths=[0.8*inch, 1.5*inch, 0.8*inch, 1.5*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.grey),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        story.append(info_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Chord progressions and lyrics
        current_section = None
        
        for line_data in chord_sheet.lines:
            # Check if this is a section header
            if line_data.lyrics_line.startswith('[') and line_data.lyrics_line.endswith(']'):
                section_name = line_data.lyrics_line.strip('[]')
                story.append(Paragraph(section_name, section_style))
                current_section = section_name
                continue
            
            # Skip empty lines
            if not line_data.lyrics_line.strip():
                story.append(Spacer(1, 0.1*inch))
                continue
            
            # Create chord line if chords exist
            if line_data.chords:
                chord_line = self._create_chord_line(
                    line_data.lyrics_line, 
                    line_data.chords,
                    transpose
                )
                story.append(Paragraph(chord_line, chord_style))
            
            # Add lyrics line
            story.append(Paragraph(line_data.lyrics_line, lyrics_style))
        
        # Build PDF
        doc.build(story)
        return output_path
    
    def _create_chord_line(
        self, 
        lyrics_line: str, 
        chords: list[tuple[int, str]],
        transpose: int = 0
    ) -> str:
        """Create a line showing chord positions above lyrics"""
        # Transpose chords if needed
        if transpose != 0:
            chords = [(pos, self._transpose_chord(chord, transpose)) for pos, chord in chords]
        
        # Create chord line with proper spacing
        chord_line_chars = [' '] * len(lyrics_line)
        
        for position, chord in chords:
            if position < len(chord_line_chars):
                # Place chord at position
                for i, char in enumerate(chord):
                    if position + i < len(chord_line_chars):
                        chord_line_chars[position + i] = char
        
        return ''.join(chord_line_chars).rstrip()
    
    def _transpose_chord(self, chord: str, semitones: int) -> str:
        """Transpose a chord by semitones"""
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        flat_to_sharp = {'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'}
        
        # Extract root note
        root = chord[0]
        if len(chord) > 1 and chord[1] in ['#', 'b']:
            root = chord[:2]
        
        # Convert flats to sharps
        if root in flat_to_sharp:
            root = flat_to_sharp[root]
        
        # Find index and transpose
        if root in notes:
            idx = notes.index(root)
            new_idx = (idx + semitones) % 12
            new_root = notes[new_idx]
            
            # Replace root in chord
            return chord.replace(root, new_root, 1)
        
        return chord