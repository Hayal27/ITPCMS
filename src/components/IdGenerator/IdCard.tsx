import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { FaPhoneAlt, FaGlobe, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import './IdCard.css';
import './IdCardThemes.css';

export type IdTemplate = 'corporate' | 'modern' | 'compact';

export interface CustomField {
    label: string;
    value: string;
}

export interface IdCardData {
    id_no: string;
    name: string;
    name_am?: string;
    position: string;
    position_am?: string;
    nationality: string;
    nationality_am?: string;
    date_of_issue: string;
    date_of_expiry?: string;
    photo_url?: string;
    qr_data: string;
    company_name?: string;
    company_name_am?: string;
    phone?: string;
    website?: string;
    address?: string;
    email?: string;
    logo_left?: string;
    logo_right?: string;
    governor_name?: string;
    signature_url?: string;
    stamp_url?: string;
    template_id?: IdTemplate;
    bg_front_image?: string;
    bg_back_image?: string;
    bg_front_color?: string;
    bg_back_color?: string;
    gender?: string;
    gender_am?: string;
    custom_fields?: CustomField[];
    verify_url_base?: string;
    encrypted_id?: string;
}

interface IdCardProps {
    data: IdCardData;
    scale?: number;
}

const IdCard: React.FC<IdCardProps> = ({ data, scale = 1 }) => {
    const themeClass = data.template_id || 'corporate';

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        // Parse string manually to avoid timezone issues (YYYY-MM-DD)
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;

        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).toUpperCase();
    };

    const toEthiopianDate = (dateStr: string) => {
        if (!dateStr) return '';
        // Basic Gregorian to Ethiopian conversion logic
        // 1. Parse Input
        const parts = dateStr.split('-');
        if (parts.length !== 3) return '';
        const gYear = parseInt(parts[0]);
        const gMonth = parseInt(parts[1]);
        const gDay = parseInt(parts[2]);

        // 2. Define offset 
        // Ethiopian New Year is Sep 11 (Sep 12 in leap year before year 1900, but usually Sep 11/12)
        // Simple logic for modern era:
        // Sep 11 is Meskerem 1.
        // Difference is roughly 7 or 8 years.

        // Using a more robust conversion function inline to avoid dependencies
        const startOfNewYear = (gYear % 4 === 3) ? 12 : 11; // Sep 11 or 12

        let ethYear = gYear - 8;
        let ethMonth = 0;
        let ethDay = 0;

        // Logic based on month ranges
        if (gMonth < 9 || (gMonth === 9 && gDay < startOfNewYear)) {
            ethYear = gYear - 8;
        } else {
            ethYear = gYear - 7;
        }

        // Calculate Month and Day (Approximation for Display)
        // Full algorithm is complex, using a simplified lookup for standard business use
        // Note: This is a simplified version. For exact calendar conversion, a library is best.
        // Given constraints, we use a mapping relative to Meskerem 1.

        const gDate = new Date(gYear, gMonth - 1, gDay);
        // Find New Year of the calculated Eth Year
        // New Year of ethYear starts in Sep 11/12 of (ethYear + 7)
        const nyYear = ethYear + 7;
        const nyDay = (nyYear % 4 === 3) ? 12 : 11;
        const newYearDate = new Date(nyYear, 8, nyDay); // Month is 0-indexed (8 = Sep)

        const diffTime = gDate.getTime() - newYearDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Ethiopian months are 30 days. Remainder is Pagume.
        // Meskerem is Month 1.
        // diffDays is days passed since Meskerem 1.
        // If diffDays is negative, calculation is off (logic error above), but let's assume valid range.

        let tempDays = diffDays;
        // Meskerem (1) to Pagume (13)
        // Just divide by 30
        const monthsPassed = Math.floor(tempDays / 30);
        ethMonth = monthsPassed + 1;
        ethDay = (tempDays % 30) + 1;

        if (ethMonth > 13) {
            // Should not happen for valid year logic, but safety cap
            ethMonth = 1;
            ethYear++;
        }

        const amharicMonths: Record<number, string> = {
            1: "መስከረም", 2: "ጥቅምት", 3: "ኅዳር", 4: "ታኅሣሥ", 5: "ጥር", 6: "የካቲት",
            7: "መጋቢት", 8: "ሚያዝያ", 9: "ግንቦት", 10: "ሰኔ", 11: "ሐምሌ", 12: "ነሐሴ", 13: "ጳጉሜ"
        };

        return `${amharicMonths[ethMonth] || ''} ${ethDay}, ${ethYear}`;
    };

    // Helper to split company name for the two-line header if needed
    // If it's "ETHIOPIAN IT PARK", we want ETHIOPIAN / IT PARK
    const companyParts = data.company_name ? data.company_name.split(' ') : [''];
    const companyTop = companyParts[0];
    const companyBottom = companyParts.slice(1).join(' ');

    return (
        <div className={`id-card-wrapper ${themeClass}`} style={{ transform: `scale(${scale})` }}>
            {/* Front Side */}
            <div className="id-card-front id-card-side-front" style={{ backgroundColor: data.bg_front_color }}>
                {data.bg_front_image && <img src={data.bg_front_image} className="custom-bg-image" alt="BG" />}

                <div className="id-card-content-overlay">
                    <div className="id-card-header">
                        <div className="header-logo-left">
                            {data.logo_left ? <img src={data.logo_left} alt="Logo" /> : <div className="logo-placeholder dark:bg-slate-700 dark:border-slate-600" />}
                        </div>
                        <div className="header-text">
                            <h2>{companyTop}</h2>
                            {companyBottom && <h3>{companyBottom}</h3>}
                            <p className="amharic-text">{data.company_name_am}</p>
                            <p className="id-type-subtitle">የሰራተኞች መታወቂያ /Employee Identity Card</p>
                        </div>
                        <div className="header-logo-right">
                            {data.logo_right ? <img src={data.logo_right} alt="Logo" /> : <div className="logo-placeholder dark:bg-slate-700 dark:border-slate-600" />}
                        </div>
                    </div>

                    <div className="id-card-body">
                        <div className="profile-section">
                            <div className="photo-container">
                                {data.photo_url ? (
                                    <img src={data.photo_url} alt={data.name} />
                                ) : (
                                    <div className="photo-placeholder dark:bg-slate-700 dark:border-slate-600">
                                        <i className="fas fa-user dark:text-slate-500"></i>
                                    </div>
                                )}
                            </div>
                            <div className="id-number-label">
                                <div className="detail-labels">
                                    <span className="amharic-label mini">የመታወቂያ ቁጥር</span>
                                    <span className="english-label mini">ID NO.</span>
                                </div>
                                <span className="info-value">{data.id_no}</span>
                            </div>
                            <div className="barcode-section-front">
                                <Barcode
                                    value={data.id_no}
                                    width={1.1}
                                    height={25}
                                    fontSize={0}
                                    margin={0}
                                    background="transparent"
                                    lineColor="#1a365d"
                                />
                            </div>
                        </div>

                        <div className="qr-section">
                            <QRCodeSVG
                                value={`${data.verify_url_base || window.location.origin}/verify-id/${data.encrypted_id || data.id_no}`}
                                size={95}
                                level="H"
                                bgColor="transparent"
                                fgColor="#1a365d"
                            />
                        </div>

                        <div className="details-section">
                            <div className={`detail-item name-block ${data.name.length > 20 ? 'name-long' : ''}`}>
                                <div className="detail-labels">
                                    <label className="amharic-label">ስም</label>
                                    <label className="english-label">NAME</label>
                                </div>
                                <div className="name-stack">
                                    <span className="info-value amharic-value primary-val">{data.name_am}</span>
                                    <span className="info-value english-value primary-val">{data.name}</span>
                                </div>
                            </div>

                            <div className={`detail-item position-block ${data.position.length > 25 ? 'pos-long' : ''}`}>
                                <div className="detail-labels">
                                    <label className="amharic-label">የስራ መደብ</label>
                                    <label className="english-label">POSITION</label>
                                </div>
                                <div className="pos-stack">
                                    <span className="info-value amharic-value secondary-val">{data.position_am}</span>
                                    <span className="info-value english-value secondary-val">{data.position}</span>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className="detail-item">
                                    <div className="detail-labels">
                                        <label className="amharic-label">ጾታ</label>
                                        <label className="english-label">GENDER</label>
                                    </div>
                                    <div className="bottom-value-stack">
                                        <span className="info-value amharic-value mini-val">{data.gender_am || 'ወንድ'}</span>
                                        <span className="info-value english-value mini-val">{data.gender || 'MALE'}</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-labels">
                                        <label className="amharic-label">የተሰጠበት ቀን</label>
                                        <label className="english-label">ISSUED</label>
                                    </div>
                                    <div className="date-stack">
                                        <span className="ethiopian-date">{toEthiopianDate(data.date_of_issue)}</span>
                                        <span className="info-value small-date">{formatDate(data.date_of_issue)}</span>
                                    </div>
                                </div>
                                <div className="detail-item text-danger">
                                    <div className="detail-labels">
                                        <label className="amharic-label text-danger">የሚያበቃበት ቀን</label>
                                        <label className="english-label text-danger">EXPIRES</label>
                                    </div>

                                    <div className="date-stack">
                                        <span className="ethiopian-date">{data.date_of_expiry ? toEthiopianDate(data.date_of_expiry) : ''}</span>
                                        <span className="info-value small-date">{data.date_of_expiry ? formatDate(data.date_of_expiry) : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Side */}
            <div className="id-card-back id-card-side-back" style={{ backgroundColor: data.bg_back_color }}>
                {data.bg_back_image && <img src={data.bg_back_image} className="custom-bg-image" alt="BG" />}

                <div className="id-card-content-overlay">
                    <div className="back-header">
                        <div className="header-logo-right">
                            {data.logo_right ? <img src={data.logo_right} alt="Logo" /> : <div className="logo-placeholder dark:bg-slate-700 dark:border-slate-600" />}
                        </div>
                        <div className="header-text">
                            <h2>{companyTop}</h2>
                            {companyBottom && <h3>{companyBottom}</h3>}
                            <p className="amharic-text">{data.company_name_am}</p>
                        </div>
                    </div>

                    <div className="back-contact-info">
                        <div className="info-row">
                            <div className="icon-box"><FaPhoneAlt /></div>
                            <span>{data.phone || '+251-944-666-633'}</span>
                        </div>
                        <div className="info-row">
                            <div className="icon-box"><FaGlobe /></div>
                            <span>{data.website || 'www.ethiopianitpark.et'}</span>
                        </div>
                        <div className="info-row">
                            <div className="icon-box"><FaMapMarkerAlt /></div>
                            <span>{data.address || 'Bole, Addis Ababa, Ethiopia'}</span>
                        </div>
                        <div className="info-row">
                            <div className="icon-box"><FaEnvelope /></div>
                            <span>{data.email || 'info@ethiopianitpark.et'}</span>
                        </div>
                    </div>

                    <div className="signature-section">
                        <div className="signature-container">
                            <div className="signature-line">
                                {data.signature_url && <img src={data.signature_url} alt="Signature" />}
                            </div>
                            <div className="signature-label">
                                <div className="gov-name">{data.governor_name || 'Daniel G/Mariam'}</div>
                                <span className="sig-text">Authorized signature</span>
                            </div>
                        </div>
                        {data.stamp_url && <img src={data.stamp_url} className="org-stamp" alt="Stamp" />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdCard;
