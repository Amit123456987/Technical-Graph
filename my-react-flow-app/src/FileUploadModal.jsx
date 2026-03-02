import React, { useState } from 'react';

const FileUploadModal = ({ isOpen, onClose, onSubmit }) => {
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const handlePaste = (e) => {
        // Get pasted text
        const pastedText = e.clipboardData.getData('text');
        // Update state - the useEffect will handle resizing
        setText(text + pastedText);
        // Prevent default to let React handle it
        e.preventDefault();
    };


    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // const formData = new FormData();
            let data = {
                name: name,
                text: text
            }

            await onSubmit(data); // Call the onSubmit prop with the form data

            // Reset form after successful submission
            setText('');
            setName('');
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Upload File</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Map Name : </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="text">Text Field:</label>
                        <textarea
                            id="text"
                            value={text}
                            onChange={handleChange}
                            onPaste={handlePaste}
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                maxHeight: '300px', // Maximum height before scrolling
                                overflowY: 'auto', // Show scrollbar when needed
                                resize: 'none', // Disable manual resizing
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontFamily: 'inherit',
                                fontSize: '16px',
                                lineHeight: '1.5',
                            }}
                            placeholder="Type or paste text here..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !(text && name)}
                        className="submit-button"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FileUploadModal;