import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={styles.footerContainer}>
            <div style={styles.content}>
                <p style={styles.copyrightText}>
                    © {currentYear} <strong>Durgesh Kumar</strong>. All Rights Reserved.
                </p>
                <p style={styles.legalText}>
                    Intellectual Property Protected |
                    <span style={styles.diaryBadge}>
                        Copyright Pending: Diary No. [APNA_DIARY_NUMBER_DALO]/2026-CO/SW
                    </span>
                </p>
            </div>
        </footer>
    );
};

const styles = {
    footerContainer: {
        width: '100%',
        backgroundColor: '#1a1a1a', // Aapke dark theme se match karega
        color: '#ffffff',
        padding: '20px 0',
        borderTop: '1px solid #333',
        marginTop: 'auto',
        textAlign: 'center',
        fontFamily: "'Inter', sans-serif",
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    copyrightText: {
        margin: 0,
        fontSize: '14px',
        letterSpacing: '0.5px',
    },
    legalText: {
        margin: 0,
        fontSize: '12px',
        color: '#b3b3b3',
    },
    diaryBadge: {
        marginLeft: '8px',
        backgroundColor: '#333',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#4ade80', 
        border: '1px solid #444',
    }
};

export default Footer;