import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. summary.js running.');

    // IMPORTANT CONSIDERATION FOR OFFICIAL QR SCAN:
    // This onAuthStateChanged listener is for the *user* viewing their own summary.
    // To handle official scans, you need a SEPARATE entry point and logic.
    // An official scanning a QR code should be directed to a different URL
    // (e.g., /official-lookup?userId=...), which runs different JavaScript.
    // This official-specific script must:
    // 1. Authenticate and authorize the official user.
    // 2. Extract the userId from the URL.
    // 3. Make a SECURE BACKEND call to fetch the user's data (Firebase Admin SDK or similar, NOT client-side Firestore access using the official's credentials).
    // 4. Display the fetched data if authorized.

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User is signed in. Displaying their summary:', user.uid);

            // This fetches data for the *currently logged-in user*.
            // Official lookups triggered by QR codes should use a backend process
            // to fetch data for the user ID specified in the QR code, not the logged-in official.
            const userDocRef = doc(db, 'users', user.uid);

            // Function to fetch user data from Firestore
            // IMPORTANT: This function is for the logged-in user.
            // Official data fetching based on a scanned QR code must happen securely on the backend
            // after authenticating the official.
            async function fetchUserData() {
                console.log('Attempting to fetch user data from Firestore for user:', user.uid);
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                         console.log('Successfully fetched user data:', userData);
                         // Combine relevant info from user and profile structure
                        return {
                            uid: user.uid,
                            email: user.email,
                            name: userData.name || 'Not specified',
                            surname: userData.surname || 'Not specified',
                            idNumber: userData.idNumber || 'Not specified',
                            dateOfBirth: userData.dateOfBirth || 'Not specified',
                            gender: userData.gender || 'Not specified',
                            maritalStatus: userData.maritalStatus || 'Not specified',
                            nationality: userData.nationality || 'Not specified',
                            phone: userData.phone || 'Not specified',
                            physicalAddress1: userData.physicalAddress1 || 'Not specified',
                            physicalAddress2: userData.physicalAddress2 || '',
                            postalAddress1: userData.postalAddress1 || 'Not specified',
                            postalAddress2: userData.postalAddress2 || '',
                            emergencyName: userData.emergencyName || 'Not specified',
                            emergencyRelationship: userData.emergencyRelationship || 'Not specified',
                            emergencyPhone1: userData.emergencyPhone1 || 'Not specified',
                            emergencyPhone2: userData.emergencyPhone2 || 'Not specified',
                            emergencyEmail: userData.emergencyEmail || 'Not specified',
                            emergencyPhysicalAddress1: userData.emergencyPhysicalAddress1 || 'Not specified',
                            emergencyPhysicalAddress2: userData.emergencyPhysicalAddress2 || '',
                            memberSince: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A',
                            profilePicture: userData.profilePicture || null, // Add profile picture URL
                            // Assuming isVerified is stored in the user document
                            isVerified: userData.isVerified || false
                        };
                    } else {
                        console.log('No user data found in Firestore for user:', user.uid);
                        return null;
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    throw error; // Re-throw the error to be caught by the caller
                }
            }

            // Function to fetch uploaded documents (replace with actual data fetching logic from Firestore)
            // IMPORTANT: For official views via QR scan, document fetching also needs to be a secure backend operation
            // with proper authorization checks for the official.
            async function fetchUserDocuments() {
                console.log('Attempting to fetch user documents...');
                try {
                     // TODO: Implement actual fetching of user documents from Firestore
                    // This would likely involve querying a 'documents' collection where each document is linked to a user ID
                    // Example placeholder data:
                    const documents = [
                        { name: 'Passport Scan', status: 'verified' },
                        { name: 'Utility Bill', status: 'pending' },
                        { name: 'Bank Statement', status: 'expired' }
                    ];
                    console.log('Successfully fetched user documents (placeholder):', documents);
                    return documents;
                } catch (error) {
                    console.error('Error fetching user documents:', error);
                    throw error; // Re-throw the error
                }

            }

            // Function to fetch verification status based on fetched user data
             // IMPORTANT: Ensure the verification status displayed is suitable and trustworthy for official use.
            async function fetchVerificationStatus(userData) {
                console.log('Attempting to fetch verification status...');
                 if (userData) {
                    const isVerified = userData.isVerified || false; // Assuming a boolean field 'isVerified'
                     console.log('Fetched verification status:', isVerified);
                    return {
                        status: isVerified ? 'Completed' : 'Pending',
                        details: isVerified ? 'Identity verified.' : 'Identity verification is pending or incomplete.'
                    };
                 } else {
                     console.log('User data not available for verification status.');
                     return { status: 'Unknown', details: 'User data not available.' };
                 }
            }

            // Function to generate QR code
            // IMPORTANT: For the QR code intended for official scanning,
            // the 'data' parameter should contain the user's unique ID (e.g., UID)
            // formatted as a URL that directs to your official lookup page, like
            // `https://your-official-site.com/official-lookup?userId=USER_UID`.
            // The official lookup page will handle authentication and data retrieval.
            function generateQRCode(data) {
                console.log('Generating QR code...');
                const qrcodeElement = document.getElementById('qrcode');
                if (qrcodeElement) {
                    qrcodeElement.innerHTML = ''; // Clear previous QR code
                    new QRCode(qrcodeElement, {
                        text: data, // This should be the official lookup URL with user ID
                        width: 128,
                        height: 128,
                    });
                     console.log('QR code generated.');
                } else {
                    console.warn('QR code element not found.');
                }
            }

            // Function to display user information
           function displayUserInfo(userInfo, error = null) {
                console.log('Displaying user info...');
                const fullNameSpan = document.getElementById('summaryFullName');
                const emailSpan = document.getElementById('summaryEmail');
                const phoneSpan = document.getElementById('summaryPhone');
                const idNumberSpan = document.getElementById('summaryIdNumber');
                const dobSpan = document.getElementById('summaryDob');
                const genderSpan = document.getElementById('summaryGender');
                const maritalStatusSpan = document.getElementById('summaryMaritalStatus');
                const nationalitySpan = document.getElementById('summaryNationality');
                const physicalAddress1Span = document.getElementById('summaryPhysicalAddress1');
                const physicalAddress2Span = document.getElementById('summaryPhysicalAddress2');
                const postalAddress1Span = document.getElementById('summaryPostalAddress1');
                const postalAddress2Span = document.getElementById('summaryPostalAddress2');
                const memberSinceSpan = document.getElementById('summaryMemberSince');
                const emergencyNameSpan = document.getElementById('summaryEmergencyName');
                const emergencyRelationshipSpan = document.getElementById('summaryEmergencyRelationship');
                const emergencyPhone1Span = document.getElementById('summaryEmergencyPhone1');
                const emergencyPhone2Span = document.getElementById('summaryEmergencyPhone2');
                const emergencyEmailSpan = document.getElementById('summaryEmergencyEmail');
                const emergencyPhysicalAddress1Span = document.getElementById('summaryEmergencyPhysicalAddress1');
                const emergencyPhysicalAddress2Span = document.getElementById('summaryEmergencyPhysicalAddress2');
                const profilePictureImg = document.getElementById('summaryProfilePicture'); // Get the image element


                if (userInfo) {
                    if(fullNameSpan) fullNameSpan.textContent = `${userInfo.name} ${userInfo.surname}`.trim() || 'Not specified';
                    if(emailSpan) emailSpan.textContent = userInfo.email || 'Not specified';
                    if(phoneSpan) phoneSpan.textContent = userInfo.phone || 'Not specified';
                    if(idNumberSpan) idNumberSpan.textContent = userInfo.idNumber || 'Not specified';
                    if(dobSpan) dobSpan.textContent = userInfo.dateOfBirth || 'Not specified';
                    if(genderSpan) genderSpan.textContent = userInfo.gender || 'Not specified';
                    if(maritalStatusSpan) maritalStatusSpan.textContent = userInfo.maritalStatus || 'Not specified';
                    if(nationalitySpan) nationalitySpan.textContent = userInfo.nationality || 'Not specified';
                    if(physicalAddress1Span) physicalAddress1Span.textContent = userInfo.physicalAddress1 || 'Not specified';
                    if(physicalAddress2Span) physicalAddress2Span.textContent = userInfo.physicalAddress2 || '';
                    if(postalAddress1Span) postalAddress1Span.textContent = userInfo.postalAddress1 || 'Not specified';
                    if(postalAddress2Span) postalAddress2Span.textContent = userInfo.postalAddress2 || '';
                    if(memberSinceSpan) memberSinceSpan.textContent = userInfo.memberSince || 'Not specified';
                    if(emergencyNameSpan) emergencyNameSpan.textContent = userInfo.emergencyName || 'Not specified';
                    if(emergencyRelationshipSpan) emergencyRelationshipSpan.textContent = userInfo.emergencyRelationship || 'Not specified';
                    if(emergencyPhone1Span) emergencyPhone1Span.textContent = userInfo.emergencyPhone1 || 'Not specified';
                    if(emergencyPhone2Span) emergencyPhone2Span.textContent = userInfo.emergencyPhone2 || 'Not specified';
                    if(emergencyEmailSpan) emergencyEmailSpan.textContent = userInfo.emergencyEmail || 'Not specified';
                    if(emergencyPhysicalAddress1Span) emergencyPhysicalAddress1Span.textContent = userInfo.emergencyPhysicalAddress1 || 'Not specified';
                    if(emergencyPhysicalAddress2Span) emergencyPhysicalAddress2Span.textContent = userInfo.emergencyPhysicalAddress2 || '';

                    // Set profile picture source if available
                    if (profilePictureImg && userInfo.profilePicture) {
                        profilePictureImg.src = userInfo.profilePicture;
                        profilePictureImg.style.display = 'block'; // Make sure it's visible
                    } else if (profilePictureImg) {
                        // Hide the placeholder if no picture is available
                        profilePictureImg.style.display = 'none';
                    }

                    console.log('User info displayed.');
                } else if (error) {
                     const userInfoSection = document.querySelector('.user-info-section .info-grid');
                     if(userInfoSection) userInfoSection.innerHTML = `<p>Error loading user details: ${error.message || error}</p>`;
                     console.error('Error displaying user info:', error);
                     if (profilePictureImg) profilePictureImg.style.display = 'none'; // Hide on error
                } else {
                     const userInfoSection = document.querySelector('.user-info-section .info-grid');
                     if(userInfoSection) userInfoSection.innerHTML = '<p>Could not load user information.</p>';
                      console.warn('User info data is null.');
                      if (profilePictureImg) profilePictureImg.style.display = 'none'; // Hide if no data
                }
            }

            // Function to display uploaded documents
            function displayUserDocuments(documents, error = null) {
                console.log('Displaying user documents...');
                const documentListDiv = document.querySelector('.documents-section .document-list');
                if (documentListDiv) {
                     documentListDiv.innerHTML = ''; // Clear loading text
                    if (documents && documents.length > 0) {
                        documents.forEach(doc => {
                            const documentItem = document.createElement('div');
                            documentItem.classList.add('document-item');
                            documentItem.innerHTML = `
                                <span class="icon">📘</span>
                                <span class="doc-name">${doc.name}</span>
                                <span class="status ${doc.status}">${doc.status}</span>
                            `;
                            documentListDiv.appendChild(documentItem);
                        });
                        console.log('User documents displayed.');
                    } else if (error) {
                         documentListDiv.innerHTML = `<p>Error loading documents: ${error.message || error}</p>`;
                         console.error('Error displaying user documents:', error);
                    }
                    else {
                        documentListDiv.innerHTML = '<p>No documents uploaded yet.</p>';
                         console.log('No user documents found or documents data is null.');
                    }
                }
            }

            // Function to display verification status
            function displayVerificationStatus(verification, error = null) {
                console.log('Displaying verification status...');
                const verificationSection = document.querySelector('.verification-section');
                const verificationStatusContentDiv = document.getElementById('verificationStatusContent'); // Target the content div

                if (verificationSection && verificationStatusContentDiv) { // Check for the content div
                    if (verification) {
                        const statusClass = verification.status.toLowerCase();
                        verificationStatusContentDiv.innerHTML = `
                            <div class="verification-status ${statusClass}">
                                <i class="fas ${statusClass === 'completed' ? 'fa-check-circle' : statusClass === 'pending' ? 'fa-clock' : 'fa-times-circle'}"></i> ${verification.status}
                            </div>
                            <div class="verification-details">
                                <span><i class="fas fa-info-circle"></i> ${verification.details}</span>
                            </div>
                        `;
                         console.log('Verification status displayed.');
                    } else if (error) {
                         verificationStatusContentDiv.innerHTML = `<p>Error loading verification status: ${error.message || error}</p>`;
                         console.error('Error displaying verification status:', error);
                    }
                    else {
                        verificationStatusContentDiv.innerHTML = '<p>Could not load verification status.</p>';
                         console.warn('Verification data is null.');
                    }
                }
            }

            // --- Main execution flow (for the logged-in user viewing their own summary) ---

            console.log('Starting main execution flow for logged-in user...');

            // Use Promise.all to fetch data concurrently for the logged-in user
            Promise.all([
                fetchUserData(),
                fetchUserDocuments(), // This is still using placeholder data and needs secure backend implementation
                fetchVerificationStatus(null) // Pass null initially, will re-fetch if needed after userInfo
            ]).then(([userInfo, documents, initialVerification]) => {
                // Display user information and generate QR code
                displayUserInfo(userInfo);

                // Generate QR code with a link to the official lookup page including the user's UID
                 if (userInfo && userInfo.uid) {
                   // IMPORTANT: Replace 'YOUR_OFFICIAL_LOOKUP_URL' with the actual secure URL
                   // for officials to view summaries, and ensure it can handle the 'userId' parameter.
                   const officialLookupUrl = `YOUR_OFFICIAL_LOOKUP_URL?userId=${userInfo.uid}`;
                   generateQRCode(officialLookupUrl);
                   console.log(`Generated QR code with URL: ${officialLookupUrl}`);
                 } else {
                     console.warn('User UID not available for QR code. Cannot generate official lookup QR.');
                     generateQRCode('Error: User ID missing'); // Generate an error QR code
                 }

                // Display verification status (using fetched userInfo)
                 if (userInfo) {
                     fetchVerificationStatus(userInfo).then(verification => {
                         displayVerificationStatus(verification);
                     }).catch(error => {
                         console.error('Error fetching verification status after user data:', error);
                         displayVerificationStatus(null, error);
                     });
                 } else {
                     // If user info failed to load, display initial verification status (which will be an error)
                     displayVerificationStatus(initialVerification);
                 }

                // Display uploaded documents
                displayUserDocuments(documents);

            }).catch(error => {
                console.error('Error during initial data fetch for logged-in user:', error);
                 // Update all sections to show error message if any of the initial fetches failed
                 displayUserInfo(null, error);
                 displayUserDocuments(null, error);
                 displayVerificationStatus(null, error);
            });


        } else {
            // User is not signed in, redirect to login page
            console.log('User is not signed in. Redirecting to index.html');
            // IMPORTANT: Official users should have a separate, secure login process,
            // NOT be redirected to the standard user login page.
            window.location.href = 'index.html';
        }
    });
});