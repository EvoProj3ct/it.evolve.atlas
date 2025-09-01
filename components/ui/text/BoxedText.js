// File: components/BoxedText.jsx
import React from "react";
import styles from "./BoxedTextStyles.module.css";


function BoxedText({ title, children, className, ariaLabel, showControls = true }) {
    const cls = [styles.varsScope, styles.section, className].filter(Boolean).join(" ");


    return (
        <section className={cls} aria-label={title ? undefined : ariaLabel}>
            <div className={styles.content}>
                {showControls && (
                    <div className={styles.windowBar} role="toolbar" aria-label="Window controls">
                        <button type="button" className={`${styles.btn} ${styles.min}`} aria-label="Minimize" />
                        <button type="button" className={`${styles.btn} ${styles.max}`} aria-label="Maximize" />
                        <button type="button" className={`${styles.btn} ${styles.cls}`} aria-label="Close" />
                    </div>
                )}
                {title && <h1 className={styles.title}>{title}</h1>}
                <div className={styles.body}>{children}</div>
            </div>
        </section>
    );
}


export default BoxedText;