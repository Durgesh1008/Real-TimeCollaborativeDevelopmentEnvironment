import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={styles.footerContainer}>
            <div style={styles.content}>
                <p style={styles.copyrightText}>
                    © {currentYear} <strong>Durgesh</strong> | Intellectual Property Protected
                </p>
                <div style={styles.legalRow}>
                    <span style={styles.diaryBadge}>
                        Copyright Pending: Diary No. SW-18572/2026-CO
                    </span>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footerContainer: {
        width: '100%',
        backgroundColor: '#111', // Slightly darker for depth
        color: '#888',           // Subtle text color
        padding: '12px 0',       // Reduced padding
        borderTop: '1px solid #222',
        textAlign: 'center',
        fontFamily: "'Inter', sans-serif",
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
    },
    copyrightText: {
        margin: 0,
        fontSize: '13px',
        color: '#ccc',
    },
    legalRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    diaryBadge: {
        fontSize: '11px',
        color: '#4ade80', // Greenish highlight
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        padding: '1px 8px',
        borderRadius: '12px',
        border: '1px solid rgba(74, 222, 128, 0.2)',
    }
};

export default Footer;