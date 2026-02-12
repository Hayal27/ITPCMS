import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import {
    getAllIdCardPersons,
    IdCardPerson,
    saveBulkIds,
    getAllIdTemplates,
    saveIdTemplate,
    updateIdTemplate,
    IdTemplateConfig,
    fixImageUrl,
    getAllEmployees,
    Employee,
    WEBSITE_URL,
    uploadIdCardPhoto
} from '../../services/apiService';
import IdCard, { IdCardData, IdTemplate, CustomField } from '../../components/IdGenerator/IdCard';
import { Card, Button, Form, Spinner, Badge, Toast, ToastContainer, InputGroup, Nav, Table, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const IdGeneratorPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [persons, setPersons] = useState<IdCardPerson[]>([]);
    const [selectedPersons, setSelectedPersons] = useState<IdCardPerson[]>([]);
    const [activeTab, setActiveTab] = useState('config');
    const [templates, setTemplates] = useState<IdTemplateConfig[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [selectedImportEmps, setSelectedImportEmps] = useState<Employee[]>([]);
    const [importSearchTerm, setImportSearchTerm] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
    const location = useLocation();

    // Configuration State
    const [config, setConfig] = useState({
        template_id: 'corporate' as IdTemplate,
        companyName: 'ETHIOPIAN IT PARK',
        companyNameAm: 'የኢትዮጵያ አይቲ ፓርክ',
        phone: '+251-944-666-633',
        website: 'www.ethiopianitpark.et',
        address: 'Bole, Addis Ababa, Ethiopia',
        email: 'info@ethiopianitpark.et',
        logoLeft: '/assets/img/logo/ITP_logo - 1.jpg',
        logoRight: '/assets/img/logo/ITP_logo - 1.jpg',
        governor_name: 'Daniel G/Mariam',
        signature_url: '',
        stamp_url: '',
        nationality: 'Ethiopian',
        nationality_am: 'ኢትዮጵያዊ',
        bg_front_image: '/assets/img/bg/uploaded_image_0_1769514223372.png',
        bg_back_image: '/assets/img/bg/uploaded_image_1_1769514223372.png',
        bg_front_color: '#ffffff',
        bg_back_color: '#ffffff',
        issued_date: '',
        expiry_date: '',
        custom_fields: [] as CustomField[]
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (location.state?.selectedIdCardPersons) {
            const incomingPersons = location.state.selectedIdCardPersons;
            setSelectedPersons(incomingPersons);
            setShowPreview(true);
            setToastMsg(`Ready to generate IDs for ${incomingPersons.length} persons`);
            setShowToast(true);
        }
        loadData();
        loadTemplates();
    }, [location]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllIdCardPersons();
            setPersons(data);

            // Also load employees for import modal
            const empData = await getAllEmployees();
            setAllEmployees(empData);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            const data = await getAllIdTemplates();
            setTemplates(data);
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName) return;
        setSaving(true);

        // Sanitize Config
        const cleanConfig = { ...config };
        Object.keys(cleanConfig).forEach(key => {
            if (typeof cleanConfig[key as keyof typeof config] === 'string') {
                (cleanConfig as any)[key] = DOMPurify.sanitize(cleanConfig[key as keyof typeof config] as string);
            }
        });

        try {
            const res = await saveIdTemplate({
                template_name: DOMPurify.sanitize(newTemplateName),
                config: cleanConfig
            });
            setActiveTemplateId(res.id);
            setToastMsg('Template saved successfully!');
            setShowToast(true);
            setShowSaveModal(false);
            loadTemplates();
        } catch (err: any) {
            setToastMsg('Failed to save template: ' + err.message);
            setShowToast(true);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateTemplate = async () => {
        if (!activeTemplateId) {
            setToastMsg('No template selected to update.');
            setShowToast(true);
            return;
        }
        setSaving(true);

        // Sanitize Config
        const cleanConfig = { ...config };
        Object.keys(cleanConfig).forEach(key => {
            if (typeof cleanConfig[key as keyof typeof config] === 'string') {
                (cleanConfig as any)[key] = DOMPurify.sanitize(cleanConfig[key as keyof typeof config] as string);
            }
        });

        try {
            console.log('Updating template:', activeTemplateId, { newTemplateName, config });
            await updateIdTemplate(activeTemplateId, {
                template_name: DOMPurify.sanitize(newTemplateName),
                config: cleanConfig
            });
            setToastMsg('Template updated successfully!');
            setShowToast(true);
            loadTemplates();
        } catch (err: any) {
            console.error('Update Error:', err);
            setToastMsg('Failed to update template: ' + (err.response?.data?.message || err.message));
            setShowToast(true);
        } finally {
            setSaving(false);
        }
    };

    const loadTemplateConfig = (template: IdTemplateConfig) => {
        // Merge with current config to ensure all new fields exist
        setConfig(prev => ({ ...prev, ...template.config }));
        setActiveTemplateId(template.id ? Number(template.id) : null);
        setNewTemplateName(template.template_name);
        setToastMsg(`Loaded template: ${template.template_name}`);
        setShowToast(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file); // Backend expects 'photo'

        try {
            const data: any = await uploadIdCardPhoto(formData);
            if (data.success && data.photo_url) {
                setConfig(prev => ({ ...prev, [fieldName]: data.photo_url }));
                setToastMsg('File uploaded successfully');
                setShowToast(true);
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setToastMsg('Upload failed: ' + err.message);
            setShowToast(true);
        }
    };

    const generateCardData = (person: IdCardPerson, index: number): IdCardData => {
        const idValue = 1000000 + index;
        const fullName = person.full_name || `${person.fname} ${person.lname}`;
        const fullNameAm = person.fname_am ? `${person.fname_am} ${person.lname_am}` : fullName;
        const idNo = person.id_number || idValue.toString();

        // Map sex (M/F) to gender name and Amharic
        const gender = person.sex === 'F' ? 'FEMALE' : 'MALE';
        const genderAm = person.sex === 'F' ? 'ሴት' : 'ወንድ';

        return {
            id_no: idNo,
            name: fullName,
            name_am: fullNameAm,
            position: person.position || 'Staff',
            position_am: person.position_am || person.position,
            nationality: person.nationality || config.nationality,
            nationality_am: config.nationality_am,
            gender: gender,
            gender_am: genderAm,
            date_of_issue: person.date_of_issue || config.issued_date || new Date().toISOString().split('T')[0],
            date_of_expiry: person.expiry_date || config.expiry_date || '',
            photo_url: fixImageUrl(person.photo_url) || undefined,
            qr_data: person.qr_data || `ID:${idNo}|NAME:${fullName}|COMP:ITPC`,
            company_name: config.companyName,
            company_name_am: config.companyNameAm,
            phone: config.phone,
            website: config.website,
            address: config.address,
            email: config.email,
            logo_left: fixImageUrl(config.logoLeft) || undefined,
            logo_right: fixImageUrl(config.logoRight) || undefined,
            governor_name: config.governor_name,
            signature_url: fixImageUrl(config.signature_url) || undefined,
            stamp_url: fixImageUrl(config.stamp_url) || undefined,
            template_id: config.template_id,
            bg_front_image: fixImageUrl(config.bg_front_image) || undefined,
            bg_back_image: fixImageUrl(config.bg_back_image) || undefined,
            bg_front_color: config.bg_front_color,
            bg_back_color: config.bg_back_color,
            custom_fields: config.custom_fields,
            verify_url_base: WEBSITE_URL
        };
    };

    const handlePrint = async () => {
        setSaving(true);
        try {
            const idsToSave = selectedPersons.map((person, index) => {
                const cardData = generateCardData(person, index);
                return {
                    content_type: 'id_card_person',
                    content_id: person.id || 0,
                    id_no: cardData.id_no,
                    name: cardData.name,
                    position: cardData.position,
                    nationality: cardData.nationality,
                    date_of_issue: cardData.date_of_issue
                };
            });
            await saveBulkIds(idsToSave);
            window.print();
        } catch (err: any) {
            setToastMsg('Error saving/printing: ' + err.message);
            setShowToast(true);
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('id-print-zone');
        if (!element) return;

        setSaving(true);
        setToastMsg('Generating precise PDF, please wait...');
        setShowToast(true);

        try {
            // Using a larger page format to ensure no clipping
            // pageWidth: 800, pageHeight: 1100 (Portrait-like feel but plenty of width)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [600, 850]
            });

            const wrappers = element.querySelectorAll('.id-card-wrapper');

            for (let i = 0; i < wrappers.length; i++) {
                const wrapper = wrappers[i];
                const front = wrapper.querySelector('.id-card-side-front') as HTMLElement;
                const back = wrapper.querySelector('.id-card-side-back') as HTMLElement;

                if (!front || !back) continue;

                if (i > 0) pdf.addPage();

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                // Capture with specific options to favor accuracy
                const captureOptions = {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: null,
                    logging: false,
                    scrollX: 0,
                    scrollY: 0
                };

                const canvasFront = await html2canvas(front, captureOptions);
                const imgFront = canvasFront.toDataURL('image/png');

                const canvasBack = await html2canvas(back, captureOptions);
                const imgBack = canvasBack.toDataURL('image/png');

                // DYNAMIC ASPECT RATIO CALCULATION
                // We keep a fixed width (450px) and calculate height based on the actual captured ratio
                const displayWidth = 450;
                const displayHeightFront = (canvasFront.height / canvasFront.width) * displayWidth;
                const displayHeightBack = (canvasBack.height / canvasBack.width) * displayWidth;

                const centerX = (pageWidth - displayWidth) / 2;
                const totalContentHeight = displayHeightFront + displayHeightBack + 60; // 60px gap
                const startY = (pageHeight - totalContentHeight) / 2;

                // PLACING IMAGES WITH MEASURED ASPECT RATIOS
                pdf.addImage(imgFront, 'PNG', centerX, startY, displayWidth, displayHeightFront);
                pdf.addImage(imgBack, 'PNG', centerX, startY + displayHeightFront + 60, displayWidth, displayHeightBack);
            }

            pdf.save(`ITP_ID_Cards_Final_${new Date().getTime()}.pdf`);
            setToastMsg('PDF Ready: Correct dimensions applied!');
        } catch (err: any) {
            console.error('PDF Error:', err);
            setToastMsg('Failed to generate PDF.');
        } finally {
            setSaving(false);
            setShowToast(true);
        }
    };

    const togglePersonSelection = (person: IdCardPerson) => {
        if (selectedPersons.some(p => p.id === person.id)) {
            setSelectedPersons(selectedPersons.filter(p => p.id !== person.id));
        } else {
            setSelectedPersons([...selectedPersons, person]);
        }
    };

    const handleImportEmployees = (selectedEmps: Employee[]) => {
        const newPersons: IdCardPerson[] = selectedEmps.map(emp => ({
            id: 10000 + (emp.employee_id || 0), // Temp ID for state
            fname: emp.fname,
            lname: emp.lname,
            position: emp.role_name || 'Staff',
            email: emp.email,
            phone: emp.phone,
            sex: emp.sex
        }));

        // Add to the list and select them
        setPersons(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = newPersons.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
        });

        setSelectedPersons(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const actuallyNew = newPersons.filter(p => !existingIds.has(p.id));
            return [...prev, ...actuallyNew];
        });

        setShowImportModal(false);
        setToastMsg(`Added ${newPersons.length} system employees to queue`);
        setShowToast(true);
    };

    const filteredPersons = persons.filter(p => {
        const name = `${p.fname} ${p.lname}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || p.id_number?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const filteredImportEmps = allEmployees.filter(emp => {
        const name = `${emp.fname} ${emp.lname}`.toLowerCase();
        const dept = (emp.department_name || '').toLowerCase();
        return name.includes(importSearchTerm.toLowerCase()) || dept.includes(importSearchTerm.toLowerCase());
    });

    return (
        <div className="container-fluid py-4 min-vh-100 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0 text-slate-900 dark:text-white font-weight-bold">ITPC ID Workspace</h1>
                    <p className="text-slate-500 dark:text-slate-400 small">Generate IDs for registered persons with dual language support.</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-info" onClick={() => setShowImportModal(true)}>
                        <i className="fas fa-file-import me-1"></i> Import Employees
                    </Button>
                    {activeTemplateId ? (
                        <Button variant="outline-primary" onClick={handleUpdateTemplate} disabled={saving}>
                            {saving ? <Spinner size="sm" /> : 'Update Template'}
                        </Button>
                    ) : (
                        <Button variant="outline-primary" onClick={() => setShowSaveModal(true)}>
                            Save As New
                        </Button>
                    )}
                    {showPreview ? (
                        <Button variant="outline-secondary" onClick={() => setShowPreview(false)}>
                            Back to Selection
                        </Button>
                    ) : (
                        <Button variant="primary" disabled={selectedPersons.length === 0} onClick={() => setShowPreview(true)}>
                            Preview {selectedPersons.length} IDs
                        </Button>
                    )}
                    {showPreview && (
                        <>
                            <Button variant="success" onClick={handleDownloadPDF} disabled={saving} className="no-print shadow-sm">
                                <i className="fas fa-file-pdf me-1"></i> {saving ? 'Generating...' : 'Download PDF'}
                            </Button>
                            <Button variant="info" onClick={handlePrint} className="no-print shadow-sm text-white">
                                <i className="fas fa-print me-1"></i> Print IDs
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="row">
                <div className={showPreview ? "col-lg-4 no-print" : "col-lg-4"}>
                    <Card className="shadow-sm border-0 bg-white dark:bg-slate-800 transition-colors duration-300">
                        <Card.Body className="p-0">
                            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as string)} className="px-3 pt-2 border-bottom dark:border-slate-700">
                                <Nav.Item><Nav.Link eventKey="config" className="dark:text-slate-400 dark:hover:text-white">Config</Nav.Link></Nav.Item>
                                <Nav.Item><Nav.Link eventKey="auth" className="dark:text-slate-400 dark:hover:text-white">Auth</Nav.Link></Nav.Item>
                                <Nav.Item><Nav.Link eventKey="saved" className="dark:text-slate-400 dark:hover:text-white">Saved</Nav.Link></Nav.Item>
                            </Nav>

                            <div className="p-4" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                                {activeTab === 'config' && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Company Name (EN/AM)</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Form.Control
                                                    size="sm"
                                                    value={config.companyName}
                                                    onChange={e => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
                                                    placeholder="English"
                                                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                                <Form.Control
                                                    size="sm"
                                                    value={config.companyNameAm}
                                                    onChange={e => setConfig(prev => ({ ...prev, companyNameAm: e.target.value }))}
                                                    placeholder="Amharic"
                                                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Contact Info</Form.Label>
                                            <div className="d-flex flex-wrap gap-2 border dark:border-slate-600 p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                                <Form.Control size="sm" placeholder="Phone" value={config.phone} onChange={e => setConfig(prev => ({ ...prev, phone: e.target.value }))} style={{ width: 'calc(50% - 4px)' }} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                <Form.Control size="sm" placeholder="Website" value={config.website} onChange={e => setConfig(prev => ({ ...prev, website: e.target.value }))} style={{ width: 'calc(50% - 4px)' }} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                <Form.Control size="sm" placeholder="Address" value={config.address} onChange={e => setConfig(prev => ({ ...prev, address: e.target.value }))} style={{ width: '100%' }} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                <Form.Control size="sm" placeholder="Email" value={config.email} onChange={e => setConfig(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%' }} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Logo Configuration</Form.Label>
                                            <div className="d-flex flex-column gap-2 border dark:border-slate-600 p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                                <div>
                                                    <Form.Label className="extra-small mb-1 dark:text-slate-400">Logo Left</Form.Label>
                                                    <Form.Control type="file" size="sm" onChange={e => handleFileUpload(e as any, 'logoLeft')} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                </div>
                                                <div>
                                                    <Form.Label className="extra-small mb-1 dark:text-slate-400">Logo Right</Form.Label>
                                                    <Form.Control type="file" size="sm" onChange={e => handleFileUpload(e as any, 'logoRight')} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                </div>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Background Images</Form.Label>
                                            <div className="d-flex flex-column gap-2 border dark:border-slate-600 p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                                <div>
                                                    <Form.Label className="extra-small mb-1 dark:text-slate-400">Front Background</Form.Label>
                                                    <Form.Control type="file" size="sm" onChange={e => handleFileUpload(e as any, 'bg_front_image')} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                </div>
                                                <div>
                                                    <Form.Label className="extra-small mb-1 dark:text-slate-400">Back Background</Form.Label>
                                                    <Form.Control type="file" size="sm" onChange={e => handleFileUpload(e as any, 'bg_back_image')} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                </div>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Default Dates</Form.Label>
                                            <div className="d-flex gap-2">
                                                <div className="flex-grow-1">
                                                    <Form.Label className="extra-small mb-1 dark:text-slate-400">Issued Date</Form.Label>
                                                    <InputGroup size="sm">
                                                        <Form.Control
                                                            type="date"
                                                            value={config.issued_date}
                                                            onChange={e => setConfig(prev => ({ ...prev, issued_date: e.target.value }))}
                                                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            title="Apply to all loaded persons"
                                                            onClick={() => {
                                                                if (!config.issued_date) return;
                                                                if (window.confirm(`Apply ${config.issued_date} to all ${persons.length} persons? This will overwrite individual dates.`)) {
                                                                    const updated = persons.map(p => ({ ...p, date_of_issue: config.issued_date }));
                                                                    setPersons(updated);
                                                                    setToastMsg("Applied Issued Date to all.");
                                                                    setShowToast(true);
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-check-double"></i>
                                                        </Button>
                                                    </InputGroup>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <Form.Label className="extra-small mb-1 dark:text-slate-400">Expiry Date</Form.Label>
                                                    <InputGroup size="sm">
                                                        <Form.Control
                                                            type="date"
                                                            value={config.expiry_date}
                                                            onChange={e => setConfig(prev => ({ ...prev, expiry_date: e.target.value }))}
                                                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            title="Apply to all loaded persons"
                                                            onClick={() => {
                                                                if (!config.expiry_date) return;
                                                                if (window.confirm(`Apply ${config.expiry_date} to all ${persons.length} persons? This will overwrite individual dates.`)) {
                                                                    const updated = persons.map(p => ({ ...p, expiry_date: config.expiry_date }));
                                                                    setPersons(updated);
                                                                    setToastMsg("Applied Expiry Date to all.");
                                                                    setShowToast(true);
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-check-double"></i>
                                                        </Button>
                                                    </InputGroup>
                                                </div>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Nationality (EN/AM)</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Form.Control size="sm" placeholder="EN" value={config.nationality} onChange={e => setConfig(prev => ({ ...prev, nationality: e.target.value }))} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                                <Form.Control size="sm" placeholder="AM" value={config.nationality_am} onChange={e => setConfig(prev => ({ ...prev, nationality_am: e.target.value }))} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                            </div>
                                        </Form.Group>
                                    </>
                                )}

                                {activeTab === 'auth' && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Governor Name</Form.Label>
                                            <Form.Control size="sm" value={config.governor_name} onChange={e => setConfig(prev => ({ ...prev, governor_name: e.target.value }))} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Governor Signature (Upload PNG)</Form.Label>
                                            <Form.Control type="file" size="sm" onChange={e => handleFileUpload(e as any, 'signature_url')} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Organization Stamp (Upload PNG)</Form.Label>
                                            <Form.Control type="file" size="sm" onChange={e => handleFileUpload(e as any, 'stamp_url')} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                        </Form.Group>
                                    </>
                                )}

                                {activeTab === 'saved' && (
                                    <div className="d-flex flex-column gap-2">
                                        {templates.map(t => (
                                            <div key={t.id} className="p-2 border dark:border-slate-600 rounded d-flex justify-content-between align-items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onClick={() => loadTemplateConfig(t)} style={{ cursor: 'pointer' }}>
                                                <div>
                                                    <div className="small font-weight-bold text-slate-700 dark:text-slate-200">{t.template_name}</div>
                                                    <div className="extra-small text-slate-400 text-uppercase">{t.config.template_id}</div>
                                                </div>
                                                <Badge bg="info">Load</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                <div className={showPreview ? "col-lg-8" : "col-lg-8"}>
                    {showPreview ? (
                        <div id="id-print-zone" className="id-card-preview-container d-flex flex-column align-items-center gap-5">
                            {selectedPersons.map((p, i) => (
                                <IdCard key={p.id} data={generateCardData(p, i)} />
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-sm border-0 bg-white dark:bg-slate-800 transition-colors duration-300">
                            <Card.Header className="bg-white dark:bg-slate-800 border-bottom dark:border-slate-700 py-3">
                                <InputGroup size="sm">
                                    <InputGroup.Text className="bg-slate-50 dark:bg-slate-700 border-dark-soft dark:border-slate-600 dark:text-slate-300"><i className="fas fa-search"></i></InputGroup.Text>
                                    <Form.Control
                                        className="bg-white dark:bg-slate-700 border-dark-soft dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                                        placeholder="Search by name or ID number..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table hover responsive className="mb-0 small align-middle dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 small text-uppercase font-weight-bold">
                                        <tr>
                                            <th style={{ width: 30 }} className="dark:border-slate-600"></th>
                                            <th className="dark:border-slate-600">Person</th>
                                            <th className="dark:border-slate-600">ID No</th>
                                            <th className="dark:border-slate-600">Position</th>
                                            <th className="dark:border-slate-600">Issued Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                                        ) : filteredPersons.map(p => (
                                            <tr key={p.id} onClick={() => togglePersonSelection(p)} style={{ cursor: 'pointer' }} className="dark:border-slate-700">
                                                <td className="dark:border-slate-700"><Form.Check checked={selectedPersons.some(sp => sp.id === p.id)} readOnly className="dark:border-slate-600" /></td>
                                                <td className="dark:border-slate-700">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="bg-slate-100 dark:bg-slate-700 rounded-circle d-flex align-items-center justify-content-center border dark:border-slate-600" style={{ width: 32, height: 32 }}>
                                                            {p.photo_url ? <img src={fixImageUrl(p.photo_url) || ''} className="rounded-circle w-100 h-100 object-fit-cover" /> : <i className="fas fa-user text-slate-400"></i>}
                                                        </div>
                                                        <div className="font-weight-bold text-slate-800 dark:text-slate-200">{p.fname} {p.lname}</div>
                                                    </div>
                                                </td>
                                                <td className="dark:border-slate-700"><Badge bg="secondary" className="opacity-75">{p.id_number || 'TBD'}</Badge></td>
                                                <td className="dark:border-slate-700 text-slate-600 dark:text-slate-400">{p.position}</td>
                                                <td className="dark:border-slate-700" onClick={e => e.stopPropagation()}>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        style={{ width: 130 }}
                                                        value={p.date_of_issue ? p.date_of_issue.split('T')[0] : ''}
                                                        onChange={e => {
                                                            const updated = persons.map(pers => pers.id === p.id ? { ...pers, date_of_issue: e.target.value } : pers);
                                                            setPersons(updated);
                                                        }}
                                                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            </div>

            <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered contentClassName="dark:bg-slate-800 dark:text-white border-0 shadow-lg">
                <Modal.Header closeButton className="border-bottom dark:border-slate-700"><Modal.Title className="h5 dark:text-white">Save Template</Modal.Title></Modal.Header>
                <Modal.Body className="py-4">
                    <Form.Group>
                        <Form.Label className="small font-weight-bold text-slate-700 dark:text-slate-300">Template Name</Form.Label>
                        <Form.Control value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="e.g., Corporate Standard 2026" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-top dark:border-slate-700">
                    <Button variant="link" onClick={() => setShowSaveModal(false)} className="text-slate-500 dark:text-slate-400">Cancel</Button>
                    <Button variant="primary" onClick={handleSaveTemplate} disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save Configuration'}</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg" centered contentClassName="dark:bg-slate-800 dark:text-white border-0 shadow-lg">
                <Modal.Header closeButton className="border-bottom dark:border-slate-700">
                    <Modal.Title className="h5 font-weight-bold dark:text-white">Import System Employees</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-bottom dark:border-slate-600">
                        <InputGroup size="sm">
                            <InputGroup.Text className="bg-white dark:bg-slate-700 border-dark-soft dark:border-slate-600 dark:text-slate-300"><i className="fas fa-search"></i></InputGroup.Text>
                            <Form.Control
                                className="bg-white dark:bg-slate-700 border-dark-soft dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                                placeholder="Filter by name or department..."
                                value={importSearchTerm}
                                onChange={(e) => setImportSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table hover responsive className="mb-0 small align-middle">
                            <thead className="bg-white sticky-top shadow-sm" style={{ zIndex: 1 }}>
                                <tr>
                                    <th style={{ width: 40 }}>
                                        <Form.Check
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedImportEmps([...filteredImportEmps]);
                                                else setSelectedImportEmps([]);
                                            }}
                                            checked={selectedImportEmps.length > 0 && selectedImportEmps.length === filteredImportEmps.length}
                                            className="dark:border-slate-600"
                                        />
                                    </th>
                                    <th className="dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Employee</th>
                                    <th className="dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Department</th>
                                    <th className="dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredImportEmps.map(emp => (
                                    <tr
                                        key={emp.employee_id}
                                        onClick={() => {
                                            if (selectedImportEmps.some(e => e.employee_id === emp.employee_id)) {
                                                setSelectedImportEmps(selectedImportEmps.filter(e => e.employee_id !== emp.employee_id));
                                            } else {
                                                setSelectedImportEmps([...selectedImportEmps, emp]);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="dark:border-slate-700">
                                            <Form.Check
                                                checked={selectedImportEmps.some(e => e.employee_id === emp.employee_id)}
                                                readOnly
                                                className="dark:border-slate-600"
                                            />
                                        </td>
                                        <td className="dark:border-slate-700">
                                            <div className="font-weight-bold text-slate-700 dark:text-slate-200">{emp.fname} {emp.lname}</div>
                                            <div className="extra-small text-slate-500 dark:text-slate-400">{emp.email}</div>
                                        </td>
                                        <td className="dark:border-slate-700 text-slate-600 dark:text-slate-400">{emp.department_name || '-'}</td>
                                        <td className="dark:border-slate-700"><Badge bg="light" className="text-slate-700 dark:text-slate-300 dark:bg-slate-700 border dark:border-slate-600">{emp.role_name}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-top dark:border-slate-700">
                    <div className="me-auto small text-slate-500 dark:text-slate-400">
                        {selectedImportEmps.length} selected for import
                    </div>
                    <Button variant="link" onClick={() => setShowImportModal(false)} className="text-slate-500 dark:text-slate-400">Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={() => handleImportEmployees(selectedImportEmps)}
                        disabled={selectedImportEmps.length === 0}
                    >
                        Add to Queue
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-end" className="p-3 no-print">
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="dark" className="text-white">
                    <Toast.Body>{toastMsg}</Toast.Body>
                </Toast>
            </ToastContainer>

            <style>{`
                .hover-light:hover { background-color: #f8f9fa; }
                .extra-small { font-size: 0.7rem; }
                
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    .no-print, .no-print * { display: none !important; }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background-color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .id-card-preview-container { 
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .id-card-wrapper {
                        page-break-after: always;
                        break-after: page;
                        margin: 0 !important;
                        padding: 20px !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        transform: scale(1.1) !important;
                    }
                    .id-card-front, .id-card-back {
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                        margin-bottom: 30px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .custom-bg-image {
                        display: block !important;
                        opacity: 1 !important;
                    }
                }
            `}</style>
        </div >
    );
};

export default IdGeneratorPage;
