const translationStore = {};
const translationSourceTextByNode = new WeakMap();
const translationSourceAttributesByElement = new WeakMap();

const commonTranslations = {
  'Settings': { mr: 'सेटिंग्ज', hi: 'सेटिंग्स' },
  'Website language': { mr: 'वेबसाइटची भाषा', hi: 'वेबसाइट की भाषा' },
  'Theme': { mr: 'थीम', hi: 'थीम' },
  'Use device setting': { mr: 'डिव्हाइसची सेटिंग वापरा', hi: 'डिवाइस सेटिंग का उपयोग करें' },
  'Light': { mr: 'लाईट', hi: 'लाइट' },
  'Dark': { mr: 'डार्क', hi: 'डार्क' },
  'Contact owner': { mr: 'मालकाशी संपर्क साधा', hi: 'मालिक से संपर्क करें' },
  'Crop Advisory': { mr: 'पीक सल्ला', hi: 'फसल सलाह' },
  'Weather Forecast': { mr: 'हवामान अंदाज', hi: 'मौसम पूर्वानुमान' },
  'Government Schemes': { mr: 'शासकीय योजना', hi: 'सरकारी योजनाएँ' },
  'Agriculture Products': { mr: 'कृषी उत्पाद', hi: 'कृषि उत्पाद' },
  'Farmer Profile': { mr: 'शेतकरी प्रोफाइल', hi: 'किसान प्रोफाइल' },
  'Mobile Number': { mr: 'मोबाइल नंबर', hi: 'मोबाइल नंबर' },
  'Farmer Login': { mr: 'शेतकरी लॉगिन', hi: 'किसान लॉगिन' },
  'Login': { mr: 'लॉगिन', hi: 'लॉगिन' },
  'Logout': { mr: 'बाहेर पडा', hi: 'लॉगआउट' },
  'Crop': { mr: 'पीक', hi: 'फसल' },
  'Variety': { mr: 'वाण', hi: 'किस्म' },
  'Sowing Date': { mr: 'पेरणीची तारीख', hi: 'बुवाई की तारीख' },
  'Soil Type': { mr: 'मातीचा प्रकार', hi: 'मिट्टी का प्रकार' },
  'Irrigation Type': { mr: 'सिंचन पद्धत', hi: 'सिंचाई का प्रकार' },
  'Current Crop Stage': { mr: 'सध्याची पीक अवस्था', hi: 'वर्तमान फसल अवस्था' },
  'Problem / Symptoms': { mr: 'समस्या / लक्षणे', hi: 'समस्या / लक्षण' },
  'Ahmedpur village': { mr: 'अहमदपूर गाव', hi: 'अहमदपुर गाँव' },
  'Field Plan': { mr: 'शेत आराखडा', hi: 'खेत योजना' },
  'Photo Scan': { mr: 'फोटो तपासणी', hi: 'फोटो जाँच' },
  'Guidance': { mr: 'मार्गदर्शन', hi: 'मार्गदर्शन' },
  'Build My Field Guidance': { mr: 'माझे शेत मार्गदर्शन तयार करा', hi: 'मेरे खेत का मार्गदर्शन बनाएं' },
  'Scan crop photo': { mr: 'पीक फोटो तपासा', hi: 'फसल फोटो जाँचें' },
  'Choose Photo': { mr: 'फोटो निवडा', hi: 'फोटो चुनें' },
  'Review Photo and Symptoms': { mr: 'फोटो आणि लक्षणे तपासा', hi: 'फोटो और लक्षणों की समीक्षा करें' },
  'Agriculture Marketplace': { mr: 'कृषी बाजारपेठ', hi: 'कृषि बाजार' },
  'Ahmedpur mandi reference': { mr: 'अहमदपूर बाजार संदर्भ', hi: 'अहमदपुर मंडी संदर्भ' },
  'View Details': { mr: 'तपशील पहा', hi: 'विवरण देखें' },
  'Add to Cart': { mr: 'कार्टमध्ये जोडा', hi: 'कार्ट में जोड़ें' },
  'Remove': { mr: 'काढा', hi: 'हटाएं' },
  'Close': { mr: 'बंद करा', hi: 'बंद करें' },
  'In stock': { mr: 'उपलब्ध', hi: 'उपलब्ध' },
  'Limited stock': { mr: 'मर्यादित साठा', hi: 'सीमित स्टॉक' },
  'Out of Stock': { mr: 'साठा उपलब्ध नाही', hi: 'स्टॉक उपलब्ध नहीं' },
  'Seller phone not publicly configured': { mr: 'विक्रेत्याचा सार्वजनिक फोन उपलब्ध नाही', hi: 'विक्रेता का सार्वजनिक फोन उपलब्ध नहीं है' },
  'Seller phone': { mr: 'विक्रेता फोन', hi: 'विक्रेता फोन' },
  'Seller contact': { mr: 'विक्रेता संपर्क', hi: 'विक्रेता संपर्क' },
  'Location': { mr: 'स्थान', hi: 'स्थान' },
  'Seller': { mr: 'विक्रेता', hi: 'विक्रेता' },
  'Quality': { mr: 'गुणवत्ता', hi: 'गुणवत्ता' },
  'Stock': { mr: 'साठा', hi: 'स्टॉक' },
  'Minimum order': { mr: 'किमान ऑर्डर', hi: 'न्यूनतम ऑर्डर' },
  'Source': { mr: 'स्रोत', hi: 'स्रोत' },
  'How to use': { mr: 'वापरण्याची पद्धत', hi: 'उपयोग कैसे करें' },
  'Current Weather': { mr: 'सध्याचे हवामान', hi: 'वर्तमान मौसम' },
  'Forecast Outlook': { mr: 'हवामान अंदाज', hi: 'पूर्वानुमान' },
  'Temperature': { mr: 'तापमान', hi: 'तापमान' },
  'Humidity': { mr: 'आर्द्रता', hi: 'नमी' },
  'Wind': { mr: 'वारा', hi: 'हवा' },
  'Rain probability': { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना' },
  'Rainfall': { mr: 'पर्जन्यमान', hi: 'वर्षा' },
  'Soil Condition': { mr: 'मातीची स्थिती', hi: 'मिट्टी की स्थिति' },
  'My Farm': { mr: 'माझे शेत', hi: 'मेरा खेत' },
  'Crop Advisory': { mr: 'पीक सल्ला', hi: 'फसल सलाह' },
  'Weather': { mr: 'हवामान', hi: 'मौसम' },
  'Dashboard': { mr: 'डॅशबोर्ड', hi: 'डैशबोर्ड' },
  'Profile': { mr: 'प्रोफाइल', hi: 'प्रोफाइल' }
  , 'Prices are reference values from the configured Ahmedpur catalog. Confirm today’s rate and seller contact at the APMC or supplier before purchase.': { mr: 'या किंमती अहमदपूर कॅटलॉगमधील संदर्भ किंमती आहेत. खरेदीपूर्वी एपीएमसी किंवा पुरवठादाराकडून आजचा दर आणि विक्रेता संपर्क तपासा.', hi: 'ये कीमतें अहमदपुर कैटलॉग की संदर्भ कीमतें हैं। खरीद से पहले एपीएमसी या सप्लायर से आज का भाव और विक्रेता संपर्क सत्यापित करें।' }
  , 'Verify today': { mr: 'आज तपासा', hi: 'आज सत्यापित करें' }
  , 'Verify live price': { mr: 'आजची किंमत तपासा', hi: 'आज की कीमत सत्यापित करें' }
  , 'Ahmedpur: confirm today’s rate': { mr: 'अहमदपूर: आजचा दर तपासा', hi: 'अहमदपुर: आज का भाव सत्यापित करें' }
  , 'Live stock verification required': { mr: 'उपलब्ध साठा तपासणे आवश्यक', hi: 'उपलब्ध स्टॉक सत्यापित करना आवश्यक' }
  , 'Verify Availability': { mr: 'उपलब्धता तपासा', hi: 'उपलब्धता सत्यापित करें' }
  , 'Agricultural reference catalogue; live price, stock, and seller verification required': { mr: 'कृषी संदर्भ कॅटलॉग; आजची किंमत, साठा आणि विक्रेता तपासणे आवश्यक', hi: 'कृषि संदर्भ कैटलॉग; आज की कीमत, स्टॉक और विक्रेता सत्यापन आवश्यक' }
  , 'Ahmedpur Market, Latur': { mr: 'अहमदपूर बाजार, लातूर', hi: 'अहमदपुर बाजार, लातूर' }
  , 'Ahmedpur agricultural market, Latur': { mr: 'अहमदपूर कृषी बाजार, लातूर', hi: 'अहमदपुर कृषि बाजार, लातूर' }
  , 'Ahmedpur market area, Latur': { mr: 'अहमदपूर बाजार परिसर, लातूर', hi: 'अहमदपुर बाजार क्षेत्र, लातूर' }
  , 'Seller verification required at Ahmedpur market': { mr: 'अहमदपूर बाजारात विक्रेता तपासणी आवश्यक', hi: 'अहमदपुर बाजार में विक्रेता सत्यापन आवश्यक' }
  , 'Purpose:': { mr: 'उद्देश:', hi: 'उद्देश्य:' }
  , 'Eligibility:': { mr: 'पात्रता:', hi: 'पात्रता:' }
  , 'Documents:': { mr: 'कागदपत्रे:', hi: 'दस्तावेज़:' }
  , 'Application:': { mr: 'अर्ज प्रक्रिया:', hi: 'आवेदन:' }
  , 'Visit Official Portal': { mr: 'अधिकृत पोर्टलला भेट द्या', hi: 'आधिकारिक पोर्टल देखें' }
  , 'No schemes are available right now.': { mr: 'सध्या कोणत्याही योजना उपलब्ध नाहीत.', hi: 'अभी कोई योजना उपलब्ध नहीं है।' }
  , 'Unable to load schemes. Please verify the official government portals directly.': { mr: 'योजना लोड करता आल्या नाहीत. कृपया अधिकृत सरकारी पोर्टल तपासा.', hi: 'योजनाएं लोड नहीं हो सकीं। कृपया आधिकारिक सरकारी पोर्टल पर जांच करें।' }
  , 'Live source:': { mr: 'थेट स्रोत:', hi: 'लाइव स्रोत:' }
  , 'Open-Meteo public weather data': { mr: 'Open-Meteo सार्वजनिक हवामान डेटा', hi: 'Open-Meteo सार्वजनिक मौसम डेटा' }
  , 'Live source unavailable; retrying official and public providers later.': { mr: 'थेट स्रोत उपलब्ध नाही; अधिकृत आणि सार्वजनिक स्रोत पुन्हा तपासले जातील.', hi: 'लाइव स्रोत उपलब्ध नहीं; आधिकारिक और सार्वजनिक स्रोत बाद में फिर जांचे जाएंगे।' }
  , 'Weather update': { mr: 'हवामान अपडेट', hi: 'मौसम अपडेट' }
  , 'Public weather data': { mr: 'सार्वजनिक हवामान डेटा', hi: 'सार्वजनिक मौसम डेटा' }
  , 'Official weather data': { mr: 'अधिकृत हवामान डेटा', hi: 'आधिकारिक मौसम डेटा' }
  , 'Official feed unavailable': { mr: 'अधिकृत स्रोत उपलब्ध नाही', hi: 'आधिकारिक स्रोत उपलब्ध नहीं' }
  , 'Official': { mr: 'अधिकृत', hi: 'आधिकारिक' }
  , 'Today': { mr: 'आज', hi: 'आज' }
  , 'Tomorrow': { mr: 'उद्या', hi: 'कल' }
  , 'Forecast': { mr: 'अंदाज', hi: 'पूर्वानुमान' }
  , 'Monitoring': { mr: 'निरीक्षण सुरू', hi: 'निगरानी जारी' }
  , 'Stable': { mr: 'स्थिर', hi: 'स्थिर' }
  , 'CROP STATUS:': { mr: 'पीक स्थिती:', hi: 'फसल स्थिति:' }
  , 'Field:': { mr: 'शेत:', hi: 'खेत:' }
  , 'Guidance basis:': { mr: 'मार्गदर्शनाचा आधार:', hi: 'मार्गदर्शन का आधार:' }
  , 'Crop Health:': { mr: 'पीक आरोग्य:', hi: 'फसल स्वास्थ्य:' }
  , 'Advice:': { mr: 'सल्ला:', hi: 'सलाह:' }
  , 'Irrigation Guidance:': { mr: 'सिंचन मार्गदर्शन:', hi: 'सिंचाई मार्गदर्शन:' }
  , 'Nutrient Guidance:': { mr: 'पोषण मार्गदर्शन:', hi: 'पोषण मार्गदर्शन:' }
  , 'Pest Monitoring:': { mr: 'कीड निरीक्षण:', hi: 'कीट निगरानी:' }
  , 'Disease Monitoring:': { mr: 'रोग निरीक्षण:', hi: 'रोग निगरानी:' }
  , 'Weather-Based Advice:': { mr: 'हवामान आधारित सल्ला:', hi: 'मौसम आधारित सलाह:' }
  , 'Next Recommended Activity:': { mr: 'पुढील शिफारस केलेली कृती:', hi: 'अगली सुझाई गई गतिविधि:' }
  , 'Important Warning:': { mr: 'महत्त्वाची सूचना:', hi: 'महत्वपूर्ण चेतावनी:' }
  , 'Refine with AI Agronomist': { mr: 'AI कृषी तज्ज्ञाकडून सुधारित सल्ला', hi: 'AI कृषि विशेषज्ञ से बेहतर सलाह' }
  , 'Preparing evidence-aware guidance...': { mr: 'पुराव्यावर आधारित मार्गदर्शन तयार होत आहे...', hi: 'साक्ष्य-आधारित मार्गदर्शन तैयार हो रहा है...' }
  , 'AI refinement': { mr: 'AI सुधारित मार्गदर्शन', hi: 'AI बेहतर मार्गदर्शन' }
  , 'Summary:': { mr: 'सारांश:', hi: 'सारांश:' }
  , 'Immediate actions': { mr: 'त्वरित कृती', hi: 'तुरंत कार्रवाई' }
  , 'What to confirm': { mr: 'काय तपासावे', hi: 'क्या सत्यापित करें' }
  , 'Public soil estimate': { mr: 'सार्वजनिक मातीचा अंदाज', hi: 'सार्वजनिक मिट्टी अनुमान' }
  , 'Clay': { mr: 'चिकणमाती', hi: 'चिकनी मिट्टी' }
  , 'Sand': { mr: 'वाळू', hi: 'रेत' }
  , 'Silt': { mr: 'गाळ', hi: 'गाद' }
  , 'Organic carbon': { mr: 'सेंद्रिय कार्बन', hi: 'जैविक कार्बन' }
  , 'Public soil data is temporarily unavailable. Use a local soil test for field decisions.': { mr: 'सार्वजनिक माती डेटा सध्या उपलब्ध नाही. शेतातील निर्णयांसाठी स्थानिक माती चाचणी वापरा.', hi: 'सार्वजनिक मिट्टी डेटा अभी उपलब्ध नहीं है। खेत के निर्णयों के लिए स्थानीय मिट्टी जांच का उपयोग करें।' }
  , 'Field check, not a final diagnosis': { mr: 'शेत तपासणी, अंतिम निदान नाही', hi: 'खेत जांच, अंतिम निदान नहीं' }
  , 'Possible issue:': { mr: 'संभाव्य समस्या:', hi: 'संभावित समस्या:' }
  , 'Observed report:': { mr: 'नोंदवलेली लक्षणे:', hi: 'दर्ज लक्षण:' }
  , 'Next step:': { mr: 'पुढील कृती:', hi: 'अगला कदम:' }
  , 'Urgency:': { mr: 'तातडी:', hi: 'तात्कालिकता:' }
  , 'Live market reference': { mr: 'थेट बाजार संदर्भ', hi: 'लाइव बाजार संदर्भ' }
  , 'Today’s Mandi Rates': { mr: 'आजचे बाजारभाव', hi: 'आज के मंडी भाव' }
  , 'Market Committee': { mr: 'बाजार समिती', hi: 'बाजार समिति' }
  , 'Minimum': { mr: 'किमान दर', hi: 'न्यूनतम दर' }
  , 'Maximum': { mr: 'कमाल दर', hi: 'अधिकतम दर' }
  , 'Modal': { mr: 'सर्वसाधारण दर', hi: 'सामान्य दर' }
  , 'Arrivals': { mr: 'आवक', hi: 'आवक' }
  , 'Unit': { mr: 'परिमाण', hi: 'इकाई' }
  , 'Loading rates...': { mr: 'दर लोड होत आहेत...', hi: 'भाव लोड हो रहे हैं...' }
  , 'Public market rates are temporarily unavailable.': { mr: 'सार्वजनिक बाजारभाव सध्या उपलब्ध नाहीत.', hi: 'सार्वजनिक मंडी भाव अभी उपलब्ध नहीं हैं।' }
  , 'Official source monitoring': { mr: 'अधिकृत स्रोत निरीक्षण', hi: 'आधिकारिक स्रोत निगरानी' }
  , 'Farmer support': { mr: 'शेतकरी सहाय्य', hi: 'किसान सहायता' }
  , 'Ahmedpur crop doctor': { mr: 'अहमदपूर पीक डॉक्टर', hi: 'अहमदपुर फसल डॉक्टर' }
  , 'Ahmedpur Market': { mr: 'अहमदपूर बाजार', hi: 'अहमदपुर बाजार' }
  , 'Crop Advisory': { mr: 'पीक सल्ला', hi: 'फसल सलाह' }
  , 'Government Schemes': { mr: 'शासकीय योजना', hi: 'सरकारी योजनाएँ' }
  , 'Agriculture Products': { mr: 'कृषी उत्पाद', hi: 'कृषि उत्पाद' }
  , 'No products available right now.': { mr: 'सध्या कोणतीही उत्पादने उपलब्ध नाहीत.', hi: 'अभी कोई उत्पाद उपलब्ध नहीं है।' }
  , 'Product information is currently unavailable.': { mr: 'उत्पादनाची माहिती सध्या उपलब्ध नाही.', hi: 'उत्पाद की जानकारी अभी उपलब्ध नहीं है।' }
  , 'Public phone not configured': { mr: 'सार्वजनिक फोन उपलब्ध नाही', hi: 'सार्वजनिक फोन उपलब्ध नहीं है' }
  , 'Verify with seller': { mr: 'विक्रेत्याकडून तपासा', hi: 'विक्रेता से सत्यापित करें' }
  , 'per': { mr: 'प्रति', hi: 'प्रति' }
  , 'Settings': { mr: 'सेटिंग्ज', hi: 'सेटिंग्स' }
  , 'Website language': { mr: 'वेबसाइटची भाषा', hi: 'वेबसाइट की भाषा' }
  , 'Theme': { mr: 'थीम', hi: 'थीम' }
  , 'Use device setting': { mr: 'डिव्हाइसची सेटिंग वापरा', hi: 'डिवाइस सेटिंग का उपयोग करें' }
  , 'Light': { mr: 'हलकी', hi: 'हल्की' }
  , 'Dark': { mr: 'गडद', hi: 'गहरी' }
  , 'Contact owner': { mr: 'मालकाशी संपर्क साधा', hi: 'मालिक से संपर्क करें' }
  , 'Close settings': { mr: 'सेटिंग्ज बंद करा', hi: 'सेटिंग्स बंद करें' }
  , 'Weather for Ahmedpur Taluka': { mr: 'अहमदपूर तालुक्यातील हवामान', hi: 'अहमदपुर तालुका का मौसम' }
  , 'Nimbus AI · Weather for farmers': { mr: 'निम्बस एआय · शेतकऱ्यांसाठी हवामान', hi: 'निम्बस एआई · किसानों के लिए मौसम' }
  , 'Nimbus AI provides location-aware weather estimates and a five-day forecast to help farmers across Ahmedpur and nearby villages plan field work. Allow location access for a forecast centered near your device, or choose a village. Forecast models estimate conditions over an area and cannot guarantee exact conditions at an individual field.': { mr: 'निम्बस एआय अहमदपूर व जवळच्या गावांतील शेतकऱ्यांना शेतीचे नियोजन करण्यासाठी ठिकाणानुसार हवामानाचा अंदाज आणि पाच दिवसांचा पूर्वानुमान देते. तुमच्या परिसरातील अंदाजासाठी स्थानाची परवानगी द्या किंवा गाव निवडा. हवामान मॉडेल परिसराचा अंदाज देतात; प्रत्येक शेतातील अचूक स्थितीची हमी देत नाहीत.', hi: 'निम्बस एआई अहमदपुर और आसपास के गांवों के किसानों को खेत की योजना बनाने के लिए स्थान-आधारित मौसम अनुमान और पांच दिन का पूर्वानुमान देता है। अपने पास का पूर्वानुमान पाने के लिए स्थान की अनुमति दें या गांव चुनें। मौसम मॉडल क्षेत्र का अनुमान देते हैं; किसी खेत की सटीक स्थिति की गारंटी नहीं देते।' }
  , 'Requesting device location and area weather…': { mr: 'डिव्हाइसचे स्थान आणि परिसरातील हवामान मिळवत आहोत…', hi: 'डिवाइस का स्थान और क्षेत्र का मौसम प्राप्त हो रहा है…' }
  , 'Village in Ahmedpur taluka': { mr: 'अहमदपूर तालुक्यातील गाव', hi: 'अहमदपुर तालुका का गांव' }
  , 'Choose an Ahmedpur taluka village': { mr: 'अहमदपूर तालुक्यातील गाव निवडा', hi: 'अहमदपुर तालुका का गांव चुनें' }
  , 'Use my current location': { mr: 'माझे सध्याचे स्थान वापरा', hi: 'मेरा वर्तमान स्थान उपयोग करें' }
  , 'Current Weather': { mr: 'सध्याचे हवामान', hi: 'वर्तमान मौसम' }
  , 'Feels like': { mr: 'जाणवणारे तापमान', hi: 'अनुभूत तापमान' }
  , 'Rain probability': { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना' }
  , 'Forecast Outlook': { mr: 'हवामानाचा अंदाज', hi: 'मौसम पूर्वानुमान' }
  , 'Checking live source...': { mr: 'हवामान स्रोत तपासत आहोत…', hi: 'मौसम स्रोत जांच रहे हैं…' }
  , 'Requesting precise device location…': { mr: 'डिव्हाइसचे अचूक स्थान मागवत आहोत…', hi: 'डिवाइस का सटीक स्थान मांगा जा रहा है…' }
  , 'Loading weather near your current location…': { mr: 'तुमच्या सध्याच्या स्थानाजवळील हवामान लोड होत आहे…', hi: 'आपके वर्तमान स्थान के पास का मौसम लोड हो रहा है…' }
  , 'Loading weather for {village}…': { mr: '{village} येथील हवामान लोड होत आहे…', hi: '{village} का मौसम लोड हो रहा है…' }
  , 'Loading…': { mr: 'लोड होत आहे…', hi: 'लोड हो रहा है…' }
  , 'No forecast data is available for this location right now.': { mr: 'या ठिकाणासाठी सध्या हवामानाचा अंदाज उपलब्ध नाही.', hi: 'इस स्थान के लिए अभी पूर्वानुमान उपलब्ध नहीं है।' }
  , 'Forecast data is unavailable from the weather source.': { mr: 'हवामान स्रोताकडून पूर्वानुमान उपलब्ध नाही.', hi: 'मौसम स्रोत से पूर्वानुमान उपलब्ध नहीं है।' }
  , 'Forecast details unavailable': { mr: 'पूर्वानुमानाचा तपशील उपलब्ध नाही', hi: 'पूर्वानुमान का विवरण उपलब्ध नहीं है' }
  , 'Model estimates can differ from field measurements.': { mr: 'मॉडेलचा अंदाज शेतातील मोजमापांपेक्षा वेगळा असू शकतो.', hi: 'मॉडल का अनुमान खेत में मापी गई स्थिति से अलग हो सकता है।' }
  , 'Weather data could not be loaded. Please try again.': { mr: 'हवामान माहिती लोड झाली नाही. कृपया पुन्हा प्रयत्न करा.', hi: 'मौसम की जानकारी लोड नहीं हो सकी। कृपया फिर कोशिश करें।' }
  , 'Location permission was denied or GPS is unavailable. Choose your village or allow location access in browser settings.': { mr: 'स्थानाची परवानगी नाकारली आहे किंवा GPS उपलब्ध नाही. गाव निवडा किंवा ब्राउझर सेटिंग्जमध्ये स्थानाची परवानगी द्या.', hi: 'स्थान की अनुमति नहीं मिली या GPS उपलब्ध नहीं है। गांव चुनें या ब्राउज़र सेटिंग में स्थान की अनुमति दें।' }
  , 'Weather data is unavailable for this location.': { mr: 'या ठिकाणासाठी हवामान माहिती उपलब्ध नाही.', hi: 'इस स्थान के लिए मौसम की जानकारी उपलब्ध नहीं है।' }
  , 'Weather provider': { mr: 'हवामान सेवा', hi: 'मौसम सेवा' }
  , 'Open-Meteo forecast model': { mr: 'Open-Meteo पूर्वानुमान मॉडेल', hi: 'Open-Meteo पूर्वानुमान मॉडल' }
  , 'Clear sky': { mr: 'निरभ्र आकाश', hi: 'साफ आसमान' }
  , 'Mainly clear': { mr: 'बहुतेक निरभ्र', hi: 'मुख्यतः साफ' }
  , 'Partly cloudy': { mr: 'अंशतः ढगाळ', hi: 'आंशिक बादल' }
  , 'Overcast': { mr: 'ढगाळ', hi: 'बादल छाए हुए' }
  , 'Fog': { mr: 'धुके', hi: 'कोहरा' }
  , 'Rime fog': { mr: 'दंवयुक्त धुके', hi: 'पाला युक्त कोहरा' }
  , 'Light drizzle': { mr: 'हलकी रिमझिम', hi: 'हल्की बूंदाबांदी' }
  , 'Drizzle': { mr: 'रिमझिम पाऊस', hi: 'बूंदाबांदी' }
  , 'Heavy drizzle': { mr: 'जोरदार रिमझिम', hi: 'तेज बूंदाबांदी' }
  , 'Light rain': { mr: 'हलका पाऊस', hi: 'हल्की बारिश' }
  , 'Rain': { mr: 'पाऊस', hi: 'बारिश' }
  , 'Heavy rain': { mr: 'जोरदार पाऊस', hi: 'तेज बारिश' }
  , 'Rain showers': { mr: 'पावसाच्या सरी', hi: 'बारिश की बौछारें' }
  , 'Heavy rain showers': { mr: 'जोरदार पावसाच्या सरी', hi: 'तेज बारिश की बौछारें' }
  , 'Thunderstorm': { mr: 'मेघगर्जनेसह वादळ', hi: 'आंधी-तूफान' }
  , 'Thunderstorm with hail': { mr: 'गारांसह वादळ', hi: 'ओलों के साथ तूफान' }
  , 'Severe thunderstorm with hail': { mr: 'गारांसह तीव्र वादळ', hi: 'ओलों के साथ भीषण तूफान' }
  , 'Weather update': { mr: 'हवामान अपडेट', hi: 'मौसम अपडेट' }
  , 'Ahmedpur, Latur, Maharashtra': { mr: 'अहमदपूर, लातूर, महाराष्ट्र', hi: 'अहमदपुर, लातूर, महाराष्ट्र' }
  , 'Nimbus AI · Weather for farmers': { mr: 'निम्बस एआय · शेतकऱ्यांसाठी हवामान', hi: 'निम्बस एआई · किसानों के लिए मौसम' }
  , 'Crop health is not assessed automatically. Enter your crop, stage, symptoms, and field details to request evidence-backed guidance.': { mr: 'पिकाच्या आरोग्याचे स्वयंचलित निदान होत नाही. पुराव्यावर आधारित मार्गदर्शन मागवण्यासाठी पीक, अवस्था, लक्षणे आणि शेताची माहिती भरा.', hi: 'फसल के स्वास्थ्य का स्वचालित आकलन नहीं किया जाता। प्रमाण-आधारित मार्गदर्शन के लिए फसल, अवस्था, लक्षण और खेत का विवरण भरें।' }
  , 'Open Crop Advisory': { mr: 'पीक सल्ला उघडा', hi: 'फसल सलाह खोलें' }
  , 'Farm crop details have not been entered.': { mr: 'शेतातील पिकाची माहिती भरलेली नाही.', hi: 'खेत की फसल का विवरण दर्ज नहीं है।' }
  , 'Add field details': { mr: 'शेताची माहिती भरा', hi: 'खेत का विवरण जोड़ें' }
  , 'Loading public estimate': { mr: 'सार्वजनिक अंदाज लोड होत आहे', hi: 'सार्वजनिक अनुमान लोड हो रहा है' }
  , 'Loading SoilGrids data for the active location...': { mr: 'निवडलेल्या ठिकाणासाठी SoilGrids माहिती लोड होत आहे…', hi: 'चुने हुए स्थान के लिए SoilGrids जानकारी लोड हो रही है…' }
  , 'Loading the weather estimate for your selected area…': { mr: 'तुमच्या निवडलेल्या परिसराचा हवामान अंदाज लोड होत आहे…', hi: 'आपके चुने हुए क्षेत्र का मौसम अनुमान लोड हो रहा है…' }
  , 'Nimbus AI provides location-aware weather estimates and a five-day forecast to help farmers across Ahmedpur and nearby villages plan field work. Allow location access for a forecast centered near your device, or choose a village. Forecast models estimate conditions over an area and cannot guarantee exact conditions at an individual field.': { mr: 'निम्बस एआय अहमदपूर व जवळच्या गावांतील शेतकऱ्यांना शेतीचे नियोजन करण्यासाठी ठिकाणानुसार हवामानाचा अंदाज आणि पाच दिवसांचा पूर्वानुमान देते. तुमच्या परिसरातील अंदाजासाठी स्थानाची परवानगी द्या किंवा गाव निवडा. हवामान मॉडेल परिसराचा अंदाज देतात; प्रत्येक शेतातील अचूक स्थितीची हमी देत नाहीत.', hi: 'निम्बस एआई अहमदपुर और आसपास के गांवों के किसानों को खेत की योजना बनाने के लिए स्थान-आधारित मौसम अनुमान और पांच दिन का पूर्वानुमान देता है। अपने पास का पूर्वानुमान पाने के लिए स्थान की अनुमति दें या गांव चुनें। मौसम मॉडल क्षेत्र का अनुमान देते हैं; किसी खेत की सटीक स्थिति की गारंटी नहीं देते।' }
  , 'Weather for Ahmedpur Taluka': { mr: 'अहमदपूर तालुक्यातील हवामान', hi: 'अहमदपुर तालुका का मौसम' }
  , 'Ahmedpur village': { mr: 'अहमदपूर गाव', hi: 'अहमदपुर गांव' }
  , 'Farmer support': { mr: 'शेतकरी सहाय्य', hi: 'किसान सहायता' }
  , 'Nimbus AI’s scheme summaries are general references and are not live application-status checks. Verify current eligibility, application dates, required documents, and availability on the official government portal before applying.': { mr: 'निम्बस एआयमधील योजनांची माहिती सामान्य संदर्भासाठी आहे; अर्जाची थेट स्थिती येथे तपासली जात नाही. अर्ज करण्यापूर्वी पात्रता, तारखा, कागदपत्रे आणि उपलब्धता अधिकृत सरकारी पोर्टलवर तपासा.', hi: 'निम्बस एआई में योजनाओं का विवरण सामान्य जानकारी है; यहां आवेदन की लाइव स्थिति नहीं देखी जाती। आवेदन से पहले पात्रता, तारीख, दस्तावेज़ और उपलब्धता आधिकारिक सरकारी पोर्टल पर जांचें।' }
  , 'Search schemes': { mr: 'योजना शोधा', hi: 'योजनाएं खोजें' }
  , 'Search by name or support type': { mr: 'नाव किंवा सहाय्य प्रकाराने शोधा', hi: 'नाम या सहायता प्रकार से खोजें' }
  , 'Coverage': { mr: 'लागू क्षेत्र', hi: 'लागू क्षेत्र' }
  , 'All coverage': { mr: 'सर्व क्षेत्र', hi: 'सभी क्षेत्र' }
  , 'No schemes match your search.': { mr: 'तुमच्या शोधाशी जुळणाऱ्या योजना नाहीत.', hi: 'आपकी खोज से मेल खाने वाली कोई योजना नहीं है।' }
  , 'Purpose:': { mr: 'उद्देश:', hi: 'उद्देश्य:' }
  , 'Eligibility summary:': { mr: 'पात्रतेचा सारांश:', hi: 'पात्रता सारांश:' }
  , 'Documents to check:': { mr: 'तपासायची कागदपत्रे:', hi: 'जांचने वाले दस्तावेज़:' }
  , 'How to apply:': { mr: 'अर्ज कसा करावा:', hi: 'आवेदन कैसे करें:' }
  , 'Check official scheme information': { mr: 'योजनेची अधिकृत माहिती तपासा', hi: 'योजना की आधिकारिक जानकारी देखें' }
  , 'Ahmedpur Market': { mr: 'अहमदपूर बाजार', hi: 'अहमदपुर बाजार' }
  , 'Ahmedpur taluka': { mr: 'अहमदपूर तालुका', hi: 'अहमदपुर तालुका' }
  , 'Nimbus AI does not have verified live stock or shop records for Ahmedpur. Search current local sellers on Google Maps and confirm price, stock, product labels, and contact details directly before purchasing.': { mr: 'अहमदपूरमधील दुकाने किंवा साठ्याची थेट पडताळलेली माहिती निम्बस एआयकडे नाही. Google Maps वर स्थानिक विक्रेते शोधा आणि खरेदीपूर्वी किंमत, साठा, उत्पादनाचे लेबल व संपर्क तपशील थेट तपासा.', hi: 'निम्बस एआई के पास अहमदपुर की दुकानों या स्टॉक का सत्यापित लाइव रिकॉर्ड नहीं है। Google Maps पर स्थानीय विक्रेता खोजें और खरीदने से पहले कीमत, स्टॉक, उत्पाद का लेबल और संपर्क विवरण सीधे जांचें।' }
  , 'Local supplier search': { mr: 'स्थानिक पुरवठादार शोध', hi: 'स्थानीय विक्रेता खोज' }
  , 'Find agricultural shops near Ahmedpur': { mr: 'अहमदपूरजवळील कृषी दुकाने शोधा', hi: 'अहमदपुर के पास कृषि दुकानें खोजें' }
  , 'Google Maps search results are provided by Google; Nimbus AI does not verify shop listings.': { mr: 'Google Maps वरील शोध परिणाम Google द्वारे दिले जातात; दुकानांच्या नोंदींची निम्बस एआय पडताळणी करत नाही.', hi: 'Google Maps के खोज परिणाम Google देता है; निम्बस एआई दुकानों की सूची सत्यापित नहीं करता।' }
  , 'Seed shops': { mr: 'बियाणे दुकाने', hi: 'बीज दुकानें' }
  , 'Fertilizer dealers': { mr: 'खत विक्रेते', hi: 'उर्वरक विक्रेता' }
  , 'Farm machinery': { mr: 'शेती यंत्रे', hi: 'कृषि मशीनें' }
  , 'Agricultural tools': { mr: 'कृषी अवजारे', hi: 'कृषि उपकरण' }
  , 'Public mandi reports': { mr: 'सार्वजनिक बाजार समिती अहवाल', hi: 'सार्वजनिक मंडी रिपोर्ट' }
  , 'Latest Available Mandi Rates': { mr: 'उपलब्ध नवीनतम बाजारभाव', hi: 'उपलब्ध नवीनतम मंडी भाव' }
  , 'Loading public market data...': { mr: 'सार्वजनिक बाजार माहिती लोड होत आहे…', hi: 'सार्वजनिक मंडी जानकारी लोड हो रही है…' }
  , 'Crop': { mr: 'पीक', hi: 'फसल' }
  , 'Market Committee': { mr: 'बाजार समिती', hi: 'मंडी समिति' }
  , 'Variety': { mr: 'वाण', hi: 'किस्म' }
  , 'Unit': { mr: 'एकक', hi: 'इकाई' }
  , 'Arrivals': { mr: 'आवक', hi: 'आवक' }
  , 'Minimum': { mr: 'किमान', hi: 'न्यूनतम' }
  , 'Maximum': { mr: 'कमाल', hi: 'अधिकतम' }
  , 'Modal': { mr: 'प्रचलित दर', hi: 'मॉडल भाव' }
  , 'Loading rates...': { mr: 'दर लोड होत आहेत…', hi: 'भाव लोड हो रहे हैं…' }
  , 'No rates were returned by the public source.': { mr: 'सार्वजनिक स्रोताकडून दर मिळाले नाहीत.', hi: 'सार्वजनिक स्रोत से भाव नहीं मिले।' }
  , 'Public market rates are temporarily unavailable.': { mr: 'सार्वजनिक बाजारभाव तात्पुरते उपलब्ध नाहीत.', hi: 'सार्वजनिक मंडी भाव अस्थायी रूप से उपलब्ध नहीं हैं।' }
  , 'View source report': { mr: 'मूळ अहवाल पहा', hi: 'मूल रिपोर्ट देखें' }
  , 'Today’s Mandi Rates': { mr: 'आजचे बाजारभाव', hi: 'आज के मंडी भाव' }
  , 'Farmers': { mr: 'शेतकरी', hi: 'किसान' }
  , 'Farmer Login': { mr: 'शेतकरी लॉगिन', hi: 'किसान लॉगिन' }
  , 'Mobile Number': { mr: 'मोबाइल क्रमांक', hi: 'मोबाइल नंबर' }
  , 'Allow location access after login for village-specific weather and advisories. Your exact location is used only on this device for personalization.': { mr: 'गावानुसार हवामान व सल्ल्यासाठी लॉगिननंतर स्थानाची परवानगी द्या. वैयक्तिक अनुभवासाठी तुमचे अचूक स्थान फक्त या डिव्हाइसवर वापरले जाते.', hi: 'गांव-विशिष्ट मौसम और सलाह के लिए लॉगिन के बाद स्थान की अनुमति दें। वैयक्तिकरण के लिए आपका सटीक स्थान केवल इसी डिवाइस पर उपयोग होता है।' }
  , 'Enter your mobile number.': { mr: 'तुमचा मोबाइल क्रमांक भरा.', hi: 'अपना मोबाइल नंबर दर्ज करें।' }
  , 'Name:': { mr: 'नाव:', hi: 'नाम:' }
  , 'Village:': { mr: 'गाव:', hi: 'गांव:' }
  , 'Taluka:': { mr: 'तालुका:', hi: 'तहसील:' }
  , 'District:': { mr: 'जिल्हा:', hi: 'जिला:' }
  , 'State:': { mr: 'राज्य:', hi: 'राज्य:' }
  , 'Farmer Profile': { mr: 'शेतकरी प्रोफाइल', hi: 'किसान प्रोफाइल' }
  , 'Farmer profile not available': { mr: 'शेतकरी प्रोफाइल उपलब्ध नाही', hi: 'किसान प्रोफाइल उपलब्ध नहीं' }
  , 'Not available': { mr: 'उपलब्ध नाही', hi: 'उपलब्ध नहीं' }
  , 'Nimbus AI provides location-aware area forecasts, with source and model limitations shown.': { mr: 'निम्बस एआय स्रोत व मॉडेलच्या मर्यादा स्पष्ट करून ठिकाणानुसार हवामान अंदाज देते.', hi: 'निम्बस एआई स्रोत और मॉडल की सीमाएं स्पष्ट करके स्थान-आधारित पूर्वानुमान देता है।' }
  , 'Evidence-backed field guidance when current weather, soil estimates, and AI services are available.': { mr: 'सध्याचे हवामान, मातीचे अंदाज आणि एआय सेवा उपलब्ध असल्यास पुराव्यावर आधारित शेत मार्गदर्शन.', hi: 'वर्तमान मौसम, मिट्टी के अनुमान और एआई सेवाएं उपलब्ध होने पर प्रमाण-आधारित खेत मार्गदर्शन।' }
  , 'Scheme summaries with direct official links; confirm current eligibility and application status with the department.': { mr: 'योजनांचा सारांश आणि अधिकृत दुवे; सध्याची पात्रता व अर्जाची स्थिती संबंधित विभागाकडून तपासा.', hi: 'योजनाओं का सारांश और आधिकारिक लिंक; वर्तमान पात्रता और आवेदन की स्थिति विभाग से जांचें।' }
  , 'Browse farm-supply categories and search for current local sellers; verify prices and availability directly.': { mr: 'शेती साहित्याच्या श्रेणी पाहा व स्थानिक विक्रेते शोधा; किंमत आणि उपलब्धता थेट तपासा.', hi: 'कृषि सामग्री की श्रेणियां देखें और स्थानीय विक्रेता खोजें; कीमत और उपलब्धता सीधे जांचें।' }
  , 'Weather Intelligence': { mr: 'हवामान माहिती', hi: 'मौसम जानकारी' }
  , 'AI Crop Advisory': { mr: 'एआय पीक सल्ला', hi: 'एआई फसल सलाह' }
  , 'Agriculture Marketplace': { mr: 'कृषी बाजारपेठ', hi: 'कृषि बाजार' }
  , 'Ahmedpur crop doctor': { mr: 'अहमदपूर पीक सल्ला', hi: 'अहमदपुर फसल सलाह' }
  , 'Build a field plan, scan a crop photo, and get practical next steps for your village.': { mr: 'शेताचा आराखडा भरा, पिकाचा फोटो तपासा आणि गावासाठी पुढील व्यावहारिक पावले जाणून घ्या.', hi: 'खेत की योजना भरें, फसल की तस्वीर जांचें और अपने गांव के लिए अगले व्यावहारिक कदम जानें।' }
  , 'Field Plan': { mr: 'शेत आराखडा', hi: 'खेत योजना' }
  , 'Photo Scan': { mr: 'फोटो तपासणी', hi: 'फोटो जांच' }
  , 'Guidance': { mr: 'मार्गदर्शन', hi: 'मार्गदर्शन' }
  , 'Choose crop': { mr: 'पीक निवडा', hi: 'फसल चुनें' }
  , 'Crop variety': { mr: 'पिकाचा वाण', hi: 'फसल की किस्म' }
  , 'Enter the variety shown on your seed packet': { mr: 'बियाण्याच्या पाकिटावरील वाणाचे नाव भरा', hi: 'बीज के पैकेट पर लिखी किस्म दर्ज करें' }
  , 'Field soil type': { mr: 'शेतातील मातीचा प्रकार', hi: 'खेत की मिट्टी का प्रकार' }
  , 'Choose observed field soil': { mr: 'शेतातील मातीचा प्रकार निवडा', hi: 'खेत की मिट्टी का प्रकार चुनें' }
  , 'Irrigation Type': { mr: 'सिंचनाचा प्रकार', hi: 'सिंचाई का प्रकार' }
  , 'Choose irrigation source': { mr: 'सिंचनाचा स्रोत निवडा', hi: 'सिंचाई का स्रोत चुनें' }
  , 'Choose crop stage': { mr: 'पिकाची अवस्था निवडा', hi: 'फसल की अवस्था चुनें' }
  , 'Observed problem / symptoms': { mr: 'दिसणारी समस्या / लक्षणे', hi: 'दिखाई देने वाली समस्या / लक्षण' }
  , 'Describe what you see, where it appears, and when it began. Enter “No visible symptoms” if none.': { mr: 'काय दिसते, कुठे दिसते आणि कधी सुरू झाले ते लिहा. लक्षणे नसल्यास “लक्षणे दिसत नाहीत” लिहा.', hi: 'क्या दिख रहा है, कहां दिख रहा है और कब शुरू हुआ, लिखें। लक्षण न हों तो “कोई लक्षण नहीं” लिखें।' }
  , 'Choose village': { mr: 'गाव निवडा', hi: 'गांव चुनें' }
  , 'Soil laboratory report': { mr: 'माती परीक्षण प्रयोगशाळेचा अहवाल', hi: 'मिट्टी परीक्षण प्रयोगशाला रिपोर्ट' }
  , 'Soil test date': { mr: 'माती परीक्षणाची तारीख', hi: 'मिट्टी जांच की तारीख' }
  , 'Soil pH': { mr: 'मातीचा pH', hi: 'मिट्टी का pH' }
  , 'Available nitrogen (kg/ha)': { mr: 'उपलब्ध नत्र (किलो/हेक्टर)', hi: 'उपलब्ध नाइट्रोजन (किलो/हेक्टेयर)' }
  , 'Available phosphorus (kg/ha)': { mr: 'उपलब्ध स्फुरद (किलो/हेक्टर)', hi: 'उपलब्ध फॉस्फोरस (किलो/हेक्टेयर)' }
  , 'Available potassium (kg/ha)': { mr: 'उपलब्ध पालाश (किलो/हेक्टर)', hi: 'उपलब्ध पोटैशियम (किलो/हेक्टेयर)' }
  , 'Enter the exact variety printed on the seed packet. Suggestions are not an exhaustive official Maharashtra release list or a guarantee of local suitability or availability. Confirm the variety and seed lot with the agriculture department or an authorised dealer. Nutrient guidance requires the latest field soil-test values.': { mr: 'बियाण्याच्या पाकिटावर छापलेला वाण तंतोतंत भरा. सूचना ही महाराष्ट्रातील सर्व अधिकृत वाणांची संपूर्ण यादी नाही आणि स्थानिक योग्यतेची किंवा उपलब्धतेची हमी नाही. कृषी विभाग किंवा अधिकृत विक्रेत्याकडून वाण व बियाणे लॉट तपासा. पोषणविषयक मार्गदर्शनासाठी शेतातील अलीकडील माती परीक्षण आवश्यक आहे.', hi: 'बीज के पैकेट पर छपी किस्म बिल्कुल सही दर्ज करें। सुझाव महाराष्ट्र की सभी आधिकारिक किस्मों की पूरी सूची नहीं हैं और स्थानीय उपयुक्तता या उपलब्धता की गारंटी नहीं देते। कृषि विभाग या अधिकृत विक्रेता से किस्म और बीज लॉट की पुष्टि करें। पोषण सलाह के लिए खेत की नवीनतम मिट्टी जांच आवश्यक है।' }
  , 'Build My Field Guidance': { mr: 'माझ्या शेतासाठी मार्गदर्शन तयार करा', hi: 'मेरे खेत के लिए मार्गदर्शन बनाएं' }
  , 'Scan crop photo': { mr: 'पिकाचा फोटो तपासा', hi: 'फसल की तस्वीर जांचें' }
  , 'Choose Photo': { mr: 'फोटो निवडा', hi: 'तस्वीर चुनें' }
  , 'Choose a photo from your gallery or camera. Include a clear close-up of the affected leaf, stem, flower, or fruit and, if possible, one whole-plant image. Nimbus AI can only provide a tentative visual triage, not a confirmed diagnosis.': { mr: 'गॅलरी किंवा कॅमेऱ्यातून फोटो निवडा. बाधित पान, खोड, फूल किंवा फळाचा स्पष्ट जवळचा फोटो आणि शक्य असल्यास संपूर्ण रोपाचा फोटो द्या. निम्बस एआय केवळ प्राथमिक दृश्य तपासणी करू शकते; निश्चित निदान नाही.', hi: 'गैलरी या कैमरे से तस्वीर चुनें। प्रभावित पत्ती, तना, फूल या फल का स्पष्ट नज़दीकी चित्र और संभव हो तो पूरे पौधे की तस्वीर दें। निम्बस एआई केवल प्रारंभिक दृश्य जांच कर सकता है, निश्चित निदान नहीं।' }
  , 'Before you act': { mr: 'कृती करण्यापूर्वी', hi: 'कार्रवाई से पहले' }
  , 'Photograph healthy and affected plants for comparison.': { mr: 'तुलनेसाठी निरोगी आणि बाधित रोपांचे फोटो घ्या.', hi: 'तुलना के लिए स्वस्थ और प्रभावित पौधों की तस्वीर लें।' }
  , 'Record crop, variety, village, stage, and recent rain.': { mr: 'पीक, वाण, गाव, अवस्था आणि अलीकडील पाऊस नोंदवा.', hi: 'फसल, किस्म, गांव, अवस्था और हाल की बारिश दर्ज करें।' }
  , 'Do not spray from a photo alone; confirm the cause first.': { mr: 'केवळ फोटोवरून फवारणी करू नका; आधी कारणाची खात्री करा.', hi: 'केवल तस्वीर देखकर छिड़काव न करें; पहले कारण की पुष्टि करें।' }
  , 'Review Photo and Symptoms': { mr: 'फोटो आणि लक्षणांचा आढावा घ्या', hi: 'तस्वीर और लक्षणों की समीक्षा करें' }
  , 'No visible symptoms': { mr: 'लक्षणे दिसत नाहीत', hi: 'कोई लक्षण नहीं दिखता' }
  , 'Evidence-based field guidance': { mr: 'पुराव्यावर आधारित शेत मार्गदर्शन', hi: 'प्रमाण-आधारित खेत मार्गदर्शन' }
  , 'Evidence-based guidance is unavailable.': { mr: 'पुराव्यावर आधारित मार्गदर्शन उपलब्ध नाही.', hi: 'प्रमाण-आधारित मार्गदर्शन उपलब्ध नहीं है।' }
  , 'CROP STATUS:': { mr: 'पीक स्थिती:', hi: 'फसल स्थिति:' }
  , 'Build My Field Guidance': { mr: 'माझ्या शेतासाठी मार्गदर्शन तयार करा', hi: 'मेरे खेत के लिए मार्गदर्शन बनाएं' }
  , 'Current crop data': { mr: 'सध्याची पीक माहिती', hi: 'वर्तमान फसल जानकारी' }
  , 'Choose your Ahmedpur village': { mr: 'अहमदपूरमधील तुमचे गाव निवडा', hi: 'अहमदपुर में अपना गांव चुनें' }
  , 'Examining weather and soil data…': { mr: 'हवामान व मातीची माहिती तपासत आहोत…', hi: 'मौसम और मिट्टी का डेटा जांच रहे हैं…' }
  , 'Tentative visual triage — not a diagnosis': { mr: 'प्राथमिक दृश्य तपासणी — निदान नाही', hi: 'प्रारंभिक दृश्य जांच — निदान नहीं' }
  , 'Image review': { mr: 'प्रतिमेचा आढावा', hi: 'तस्वीर की समीक्षा' }
  , 'Visible features': { mr: 'दिसणारी लक्षणे', hi: 'दिखाई देने वाली विशेषताएं' }
  , 'Possible causes (unconfirmed)': { mr: 'संभाव्य कारणे (पुष्टी नाही)', hi: 'संभावित कारण (पुष्टि नहीं)' }
  , 'Image limitations': { mr: 'प्रतिमेच्या मर्यादा', hi: 'तस्वीर की सीमाएं' }
  , 'Next steps': { mr: 'पुढील पावले', hi: 'अगले कदम' }
  , 'Expert review needed': { mr: 'तज्ज्ञांचा आढावा आवश्यक', hi: 'विशेषज्ञ की समीक्षा आवश्यक' }
  , 'Safety': { mr: 'सुरक्षितता', hi: 'सुरक्षा' }
  , 'Yes': { mr: 'होय', hi: 'हां' }
  , 'Not indicated by this image': { mr: 'या प्रतिमेवरून आवश्यक असल्याचे दिसत नाही', hi: 'इस तस्वीर से इसकी आवश्यकता नहीं दिखती' }
  , 'Summary': { mr: 'सारांश', hi: 'सारांश' }
  , 'Evidence used': { mr: 'वापरलेले पुरावे', hi: 'उपयोग किए गए प्रमाण' }
  , 'Immediate actions': { mr: 'तात्काळ कृती', hi: 'तत्काल कार्रवाई' }
  , 'Irrigation': { mr: 'सिंचन', hi: 'सिंचाई' }
  , 'Nutrition': { mr: 'पोषण', hi: 'पोषण' }
  , 'Pest and disease checks': { mr: 'कीड व रोग तपासणी', hi: 'कीट और रोग जांच' }
  , 'Weather timing': { mr: 'हवामानानुसार वेळ', hi: 'मौसम के अनुसार समय' }
  , 'What to confirm': { mr: 'कशाची खात्री करावी', hi: 'किसकी पुष्टि करें' }
  , 'Data quality': { mr: 'माहितीची गुणवत्ता', hi: 'डेटा की गुणवत्ता' }
  , 'Soil map model estimate: clay': { mr: 'माती नकाशा मॉडेलचा अंदाज: चिकणमाती', hi: 'मिट्टी मानचित्र मॉडल अनुमान: चिकनी मिट्टी' }
  , 'Public soil estimate': { mr: 'सार्वजनिक मातीचा अंदाज', hi: 'सार्वजनिक मिट्टी अनुमान' }
  , 'The public soil map is only a regional estimate and cannot replace these measurements for nutrient advice.': { mr: 'सार्वजनिक मातीचा नकाशा हा फक्त परिसराचा अंदाज आहे; पोषणविषयक सल्ल्यासाठी तो या मोजमापांची जागा घेऊ शकत नाही.', hi: 'सार्वजनिक मिट्टी का नक्शा केवल क्षेत्रीय अनुमान है; पोषण सलाह के लिए यह इन मापों का विकल्प नहीं है।' }
  , 'This field needs verified values from a recent soil laboratory report.': { mr: 'या शेतासाठी अलीकडील माती प्रयोगशाळेच्या अहवालातील पडताळलेली मूल्ये आवश्यक आहेत.', hi: 'इस खेत के लिए हाल की मिट्टी प्रयोगशाला रिपोर्ट के सत्यापित मान आवश्यक हैं।' }
  , 'Name': { mr: 'नाव', hi: 'नाम' }
  , 'Mobile Number:': { mr: 'मोबाइल क्रमांक:', hi: 'मोबाइल नंबर:' }
  , 'District': { mr: 'जिल्हा', hi: 'जिला' }
  , 'State': { mr: 'राज्य', hi: 'राज्य' }
  , 'Taluka': { mr: 'तालुका', hi: 'तहसील' }
  , 'Village': { mr: 'गाव', hi: 'गांव' }
  , 'Use your device setting': { mr: 'डिव्हाइसची सेटिंग वापरा', hi: 'डिवाइस सेटिंग का उपयोग करें' }
  , 'Rain Prob.': { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना' }
  , 'Open Source Report': { mr: 'मूळ अहवाल उघडा', hi: 'मूल रिपोर्ट खोलें' }
  , 'Loading weather estimate for {location}…': { mr: '{location} साठी हवामानाचा अंदाज लोड होत आहे…', hi: '{location} के लिए मौसम अनुमान लोड हो रहा है…' }
  , '{location} · GPS accuracy ±{accuracy} · {source} · Model time {time}. Area estimates can differ from field measurements.': { mr: '{location} · GPS अचूकता ±{accuracy} · {source} · मॉडेल वेळ {time}. परिसराचा अंदाज शेतातील मोजमापांपेक्षा वेगळा असू शकतो.', hi: '{location} · GPS सटीकता ±{accuracy} · {source} · मॉडल समय {time}. क्षेत्रीय अनुमान खेत के माप से अलग हो सकते हैं।' }
  , '{location} · {source} · Model time {time}. Area estimates can differ from field measurements.': { mr: '{location} · {source} · मॉडेल वेळ {time}. परिसराचा अंदाज शेतातील मोजमापांपेक्षा वेगळा असू शकतो.', hi: '{location} · {source} · मॉडल समय {time}. क्षेत्रीय अनुमान खेत के माप से अलग हो सकते हैं।' }
  , '{location} · GPS accuracy ±{accuracy} · {source}. Area estimates can differ from field measurements.': { mr: '{location} · GPS अचूकता ±{accuracy} · {source}. परिसराचा अंदाज शेतातील मोजमापांपेक्षा वेगळा असू शकतो.', hi: '{location} · GPS सटीकता ±{accuracy} · {source}. क्षेत्रीय अनुमान खेत के माप से अलग हो सकते हैं।' }
  , '{location} · {source}. Area estimates can differ from field measurements.': { mr: '{location} · {source}. परिसराचा अंदाज शेतातील मोजमापांपेक्षा वेगळा असू शकतो.', hi: '{location} · {source}. क्षेत्रीय अनुमान खेत के माप से अलग हो सकते हैं।' }
  , 'Failed to fetch': { mr: 'हवामान सेवा उपलब्ध नाही. इंटरनेट तपासून पुन्हा प्रयत्न करा.', hi: 'मौसम सेवा उपलब्ध नहीं है। इंटरनेट जांचकर फिर प्रयास करें।' }
  , 'The weather provider is not available right now.': { mr: 'हवामान सेवा सध्या उपलब्ध नाही.', hi: 'मौसम सेवा अभी उपलब्ध नहीं है।' }
  , 'The weather source returned incomplete current conditions or forecast data.': { mr: 'हवामान स्रोताकडून अपूर्ण वर्तमान स्थिती किंवा पूर्वानुमान मिळाले.', hi: 'मौसम स्रोत से वर्तमान स्थिति या पूर्वानुमान का अधूरा डेटा मिला।' }
  , 'Weather service returned {status}.': { mr: 'हवामान सेवेकडून {status} प्रतिसाद मिळाला.', hi: 'मौसम सेवा से {status} प्रतिक्रिया मिली।' }
  , 'Today': { mr: 'आज', hi: 'आज' }
  , 'Mon': { mr: 'सोम', hi: 'सोम' }
  , 'Tue': { mr: 'मंगळ', hi: 'मंगल' }
  , 'Wed': { mr: 'बुध', hi: 'बुध' }
  , 'Thu': { mr: 'गुरु', hi: 'गुरु' }
  , 'Fri': { mr: 'शुक्र', hi: 'शुक्र' }
  , 'Sat': { mr: 'शनि', hi: 'शनि' }
  , 'Sun': { mr: 'रवि', hi: 'रवि' }
  , 'Black soil': { mr: 'काळी माती', hi: 'काली मिट्टी' }
  , 'Deep black clay soil': { mr: 'खोल काळी चिकणमाती', hi: 'गहरी काली चिकनी मिट्टी' }
  , 'Medium black soil': { mr: 'मध्यम काळी माती', hi: 'मध्यम काली मिट्टी' }
  , 'Shallow black soil': { mr: 'उथळ काळी माती', hi: 'उथली काली मिट्टी' }
  , 'Red or brown soil': { mr: 'लाल किंवा तपकिरी माती', hi: 'लाल या भूरी मिट्टी' }
  , 'Loamy soil': { mr: 'पोयट्याची माती', hi: 'दोमट मिट्टी' }
  , 'Sandy soil': { mr: 'वालुकामय माती', hi: 'रेतीली मिट्टी' }
  , 'Other / unsure': { mr: 'इतर / खात्री नाही', hi: 'अन्य / निश्चित नहीं' }
  , 'Rainfed': { mr: 'पावसावर अवलंबून', hi: 'वर्षा आधारित' }
  , 'Open well': { mr: 'विहीर', hi: 'खुला कुआं' }
  , 'Borewell': { mr: 'बोअरवेल', hi: 'बोरवेल' }
  , 'Canal': { mr: 'कालवा', hi: 'नहर' }
  , 'Drip': { mr: 'ठिबक सिंचन', hi: 'टपक सिंचाई' }
  , 'Sprinkler': { mr: 'तुषार सिंचन', hi: 'स्प्रिंकलर सिंचाई' }
  , 'Flood / furrow': { mr: 'पाटाने / सरीने', hi: 'बाढ़ / नाली सिंचाई' }
  , 'Other': { mr: 'इतर', hi: 'अन्य' }
  , 'Land Preparation': { mr: 'जमीन तयार करणे', hi: 'भूमि की तैयारी' }
  , 'Sowing': { mr: 'पेरणी', hi: 'बुवाई' }
  , 'Vegetative Growth': { mr: 'वाढीची अवस्था', hi: 'वानस्पतिक वृद्धि' }
  , 'Flowering': { mr: 'फुलोरा', hi: 'फूल आने की अवस्था' }
  , 'Pod / Boll Formation': { mr: 'शेंगा / बोंड तयार होणे', hi: 'फली / टिंडा बनना' }
  , 'Harvesting': { mr: 'काढणी', hi: 'कटाई' }
  , 'Soybean': { mr: 'सोयाबीन', hi: 'सोयाबीन' }
  , 'Cotton': { mr: 'कापूस', hi: 'कपास' }
  , 'Tur / Pigeon Pea': { mr: 'तूर', hi: 'अरहर / तूर' }
  , 'Jowar': { mr: 'ज्वारी', hi: 'ज्वार' }
  , 'Maize': { mr: 'मका', hi: 'मक्का' }
  , 'Paddy': { mr: 'भात', hi: 'धान' }
  , 'Chickpea': { mr: 'हरभरा', hi: 'चना' }
  , 'Wheat': { mr: 'गहू', hi: 'गेहूं' }
  , 'Sugarcane': { mr: 'ऊस', hi: 'गन्ना' }
  , 'Onion': { mr: 'कांदा', hi: 'प्याज' }
  , 'Search by name or support type': { mr: 'नाव किंवा सहाय्य प्रकाराने शोधा', hi: 'नाम या सहायता प्रकार से खोजें' }
  , 'Search schemes': { mr: 'योजना शोधा', hi: 'योजनाएं खोजें' }
  , 'Loading the weather estimate for your selected area…': { mr: 'निवडलेल्या परिसराचा हवामान अंदाज लोड होत आहे…', hi: 'चुने हुए क्षेत्र का मौसम अनुमान लोड हो रहा है…' }
  , 'Loading weather near your current location…': { mr: 'तुमच्या सध्याच्या स्थानाजवळील हवामान लोड होत आहे…', hi: 'आपके वर्तमान स्थान के पास का मौसम लोड हो रहा है…' }
  , 'Selected area': { mr: 'निवडलेला परिसर', hi: 'चुना हुआ क्षेत्र' }
  , 'Weather service': { mr: 'हवामान सेवा', hi: 'मौसम सेवा' }
  , 'Rain {probability}%': { mr: 'पावसाची शक्यता {probability}%', hi: 'बारिश की संभावना {probability}%' }
  , 'Temperature': { mr: 'तापमान', hi: 'तापमान' }
  , 'Humidity': { mr: 'आर्द्रता', hi: 'नमी' }
  , 'Wind': { mr: 'वारा', hi: 'हवा' }
  , 'Rainfall': { mr: 'पर्जन्यमान', hi: 'वर्षा' }
  , 'Feels like': { mr: 'जाणवणारे तापमान', hi: 'अनुभूत तापमान' }
  , 'Settings': { mr: 'सेटिंग्ज', hi: 'सेटिंग्स' }
  , 'Crop Advisory': { mr: 'पीक सल्ला', hi: 'फसल सलाह' }
  , 'Weather Forecast': { mr: 'हवामान अंदाज', hi: 'मौसम पूर्वानुमान' }
  , 'Government Schemes': { mr: 'शासकीय योजना', hi: 'सरकारी योजनाएँ' }
  , 'Agriculture Products': { mr: 'कृषी उत्पाद', hi: 'कृषि उत्पाद' }
  , 'Logout': { mr: 'बाहेर पडा', hi: 'लॉगआउट' }
  , 'Dashboard': { mr: 'डॅशबोर्ड', hi: 'डैशबोर्ड' }
  , 'Profile': { mr: 'प्रोफाइल', hi: 'प्रोफाइल' }
  , 'English': { mr: 'English', hi: 'English' }
  , 'मराठी': { mr: 'मराठी', hi: 'मराठी' }
  , 'हिंदी': { mr: 'हिंदी', hi: 'हिंदी' }
  , 'Farmers': { mr: 'शेतकरी', hi: 'किसान' }
  , 'Rain Prob.': { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना' }
  , 'Login': { mr: 'लॉगिन', hi: 'लॉगिन' }
  , 'Farmer Login': { mr: 'शेतकरी लॉगिन', hi: 'किसान लॉगिन' }
  , 'Mobile Number': { mr: 'मोबाइल क्रमांक', hi: 'मोबाइल नंबर' }
  , 'Farmer Profile': { mr: 'शेतकरी प्रोफाइल', hi: 'किसान प्रोफाइल' }
  , 'Village': { mr: 'गाव', hi: 'गांव' }
  , 'Taluka': { mr: 'तालुका', hi: 'तहसील' }
  , 'District': { mr: 'जिल्हा', hi: 'जिला' }
  , 'State': { mr: 'राज्य', hi: 'राज्य' }
  , 'Nimbus AI · Weather for farmers': { mr: 'निम्बस एआय · शेतकऱ्यांसाठी हवामान', hi: 'निम्बस एआई · किसानों के लिए मौसम' }
  , 'Weather for Ahmedpur Taluka': { mr: 'अहमदपूर तालुक्यातील हवामान', hi: 'अहमदपुर तालुका का मौसम' }
  , 'Nimbus AI provides location-aware weather estimates and a five-day forecast to help farmers across Ahmedpur and nearby villages plan field work. Allow location access for a forecast centered near your device, or choose a village. Forecast models estimate conditions over an area and cannot guarantee exact conditions at an individual field.': { mr: 'निम्बस एआय अहमदपूर आणि आसपासच्या गावांतील शेतकऱ्यांना शेतीच्या कामाचे नियोजन करण्यासाठी स्थानावर आधारित हवामान अंदाज आणि पाच दिवसांचा पूर्वानुमान देते. तुमच्या जवळचा अंदाज पाहण्यासाठी स्थानाची परवानगी द्या किंवा गाव निवडा. अंदाज मॉडेल परिसरातील परिस्थिती दर्शवतात; विशिष्ट शेतातील अचूक परिस्थितीची हमी देत नाहीत.', hi: 'निम्बस एआई अहमदपुर और आसपास के गांवों के किसानों को खेत के काम की योजना बनाने के लिए स्थान-आधारित मौसम अनुमान और पांच दिन का पूर्वानुमान देता है। अपने पास का अनुमान देखने के लिए स्थान की अनुमति दें या गांव चुनें। पूर्वानुमान मॉडल क्षेत्र की स्थिति बताते हैं; किसी खेत की सटीक स्थिति की गारंटी नहीं देते।' }
  , 'Requesting device location and area weather…': { mr: 'डिव्हाइसचे स्थान आणि परिसराचे हवामान मिळवत आहे…', hi: 'डिवाइस का स्थान और क्षेत्र का मौसम प्राप्त किया जा रहा है…' }
  , 'Village in Ahmedpur taluka': { mr: 'अहमदपूर तालुक्यातील गाव', hi: 'अहमदपुर तालुका का गांव' }
  , 'Choose an Ahmedpur taluka village': { mr: 'अहमदपूर तालुक्यातील गाव निवडा', hi: 'अहमदपुर तालुका का गांव चुनें' }
  , 'Use my current location': { mr: 'माझे सध्याचे स्थान वापरा', hi: 'मेरा वर्तमान स्थान उपयोग करें' }
  , 'Rain probability': { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना' }
  , 'Clear sky': { mr: 'निरभ्र आकाश', hi: 'साफ़ आसमान' }
  , 'Mainly clear': { mr: 'मुख्यतः निरभ्र', hi: 'मुख्यतः साफ़' }
  , 'Partly cloudy': { mr: 'अंशतः ढगाळ', hi: 'आंशिक बादल' }
  , 'Overcast': { mr: 'ढगाळ', hi: 'बादल छाए हुए' }
  , 'Fog': { mr: 'धुके', hi: 'कोहरा' }
  , 'Depositing rime fog': { mr: 'दंवयुक्त धुके', hi: 'पाला जमाने वाला कोहरा' }
  , 'Drizzle': { mr: 'रिमझिम पाऊस', hi: 'बूंदाबांदी' }
  , 'Freezing drizzle': { mr: 'गोठणारी रिमझिम', hi: 'जमने वाली बूंदाबांदी' }
  , 'Rain': { mr: 'पाऊस', hi: 'बारिश' }
  , 'Freezing rain': { mr: 'गोठणारा पाऊस', hi: 'जमने वाली बारिश' }
  , 'Snow': { mr: 'बर्फवृष्टी', hi: 'बर्फबारी' }
  , 'Snow grains': { mr: 'बर्फकण', hi: 'बर्फ के कण' }
  , 'Rain showers': { mr: 'पावसाच्या सरी', hi: 'बारिश की बौछारें' }
  , 'Snow showers': { mr: 'बर्फाच्या सरी', hi: 'बर्फ की बौछारें' }
  , 'Thunderstorm': { mr: 'वादळी पाऊस', hi: 'आंधी-तूफ़ान' }
  , 'Thunderstorm with hail': { mr: 'गारांसह वादळी पाऊस', hi: 'ओलों के साथ आंधी-तूफ़ान' }
  , 'Thunderstorm with heavy hail': { mr: 'मोठ्या गारांसह वादळी पाऊस', hi: 'बड़े ओलों के साथ आंधी-तूफ़ान' }
  , 'Forecast': { mr: 'अंदाज', hi: 'पूर्वानुमान' }
  , 'Forecast data is unavailable from the weather source.': { mr: 'हवामान स्रोताकडून अंदाज डेटा उपलब्ध नाही.', hi: 'मौसम स्रोत से पूर्वानुमान डेटा उपलब्ध नहीं है।' }
  , 'Forecast details unavailable': { mr: 'अंदाजाचा तपशील उपलब्ध नाही', hi: 'पूर्वानुमान का विवरण उपलब्ध नहीं है' }
  , 'No forecast data is available for this location right now.': { mr: 'या स्थानासाठी सध्या अंदाज डेटा उपलब्ध नाही.', hi: 'इस स्थान के लिए अभी पूर्वानुमान डेटा उपलब्ध नहीं है।' }
  , 'The weather source returned incomplete current conditions or forecast data.': { mr: 'हवामान स्रोताकडून अपूर्ण वर्तमान स्थिती किंवा पूर्वानुमान मिळाले.', hi: 'मौसम स्रोत से वर्तमान स्थिति या पूर्वानुमान का अधूरा डेटा मिला।' }
  , 'Weather data could not be loaded. Please try again.': { mr: 'हवामान डेटा लोड झाले नाही. कृपया पुन्हा प्रयत्न करा.', hi: 'मौसम डेटा लोड नहीं हो सका। कृपया फिर प्रयास करें।' }
  , 'Requesting precise device location…': { mr: 'डिव्हाइसचे अचूक स्थान मिळवत आहे…', hi: 'डिवाइस का सटीक स्थान प्राप्त किया जा रहा है…' }
  , 'Choose a village or allow location access for a more local estimate.': { mr: 'अधिक स्थानिक अंदाजासाठी गाव निवडा किंवा स्थान परवानगी द्या.', hi: 'अधिक स्थानीय अनुमान के लिए गांव चुनें या स्थान की अनुमति दें।' }
  , 'Using {location} because precise location is unavailable. {error}': { mr: 'अचूक स्थान उपलब्ध नसल्याने {location} वापरत आहे. {error}', hi: 'सटीक स्थान उपलब्ध न होने के कारण {location} उपयोग किया जा रहा है। {error}' }
  , 'your current location': { mr: 'तुमचे सध्याचे स्थान', hi: 'आपका वर्तमान स्थान' }
  , 'current device location': { mr: 'डिव्हाइसचे सध्याचे स्थान', hi: 'डिवाइस का वर्तमान स्थान' }
  , 'selected village': { mr: 'निवडलेले गाव', hi: 'चुना हुआ गांव' }
  , 'Open-Meteo forecast model': { mr: 'Open-Meteo हवामान अंदाज मॉडेल', hi: 'Open-Meteo मौसम पूर्वानुमान मॉडल' }
  , 'Weather provider': { mr: 'हवामान डेटा प्रदाता', hi: 'मौसम डेटा प्रदाता' }
  , 'Rime fog': { mr: 'दंवयुक्त धुके', hi: 'पाला जमाने वाला कोहरा' }
  , 'Light drizzle': { mr: 'हलकी रिमझिम', hi: 'हल्की बूंदाबांदी' }
  , 'Heavy drizzle': { mr: 'जोरदार रिमझिम', hi: 'तेज़ बूंदाबांदी' }
  , 'Light rain': { mr: 'हलका पाऊस', hi: 'हल्की बारिश' }
  , 'Heavy rain': { mr: 'जोरदार पाऊस', hi: 'भारी बारिश' }
  , 'Light snow': { mr: 'हलकी बर्फवृष्टी', hi: 'हल्की बर्फबारी' }
  , 'Heavy snow': { mr: 'जोरदार बर्फवृष्टी', hi: 'भारी बर्फबारी' }
  , 'Heavy rain showers': { mr: 'जोरदार पावसाच्या सरी', hi: 'तेज़ बारिश की बौछारें' }
  , 'Severe thunderstorm with hail': { mr: 'गारांसह तीव्र वादळी पाऊस', hi: 'ओलों के साथ तेज़ आंधी-तूफ़ान' }
  , 'Weather update': { mr: 'हवामान अद्यतन', hi: 'मौसम अपडेट' }
  , 'Weather data is currently unavailable from the configured weather sources.': { mr: 'नियोजित हवामान स्रोतांकडून सध्या डेटा उपलब्ध नाही.', hi: 'कॉन्फ़िगर किए गए मौसम स्रोतों से अभी डेटा उपलब्ध नहीं है।' }
  , 'Weather location could not be resolved.': { mr: 'हवामानासाठी स्थान शोधता आले नाही.', hi: 'मौसम के लिए स्थान निर्धारित नहीं हो सका।' }
  , 'Location permission was denied or GPS is unavailable. Choose your village or allow location access in browser settings.': { mr: 'स्थान परवानगी नाकारली गेली किंवा GPS उपलब्ध नाही. तुमचे गाव निवडा किंवा ब्राउझर सेटिंग्जमध्ये स्थान परवानगी द्या.', hi: 'स्थान की अनुमति अस्वीकृत हुई या GPS उपलब्ध नहीं है। अपना गांव चुनें या ब्राउज़र सेटिंग्स में स्थान की अनुमति दें।' }
  , 'Could not determine your current location.': { mr: 'तुमचे सध्याचे स्थान शोधता आले नाही.', hi: 'आपका वर्तमान स्थान निर्धारित नहीं हो सका।' }
  , 'Weather | Nimbus AI': { mr: 'हवामान | Nimbus AI', hi: 'मौसम | Nimbus AI' }
  , 'Dashboard | Nimbus AI': { mr: 'डॅशबोर्ड | Nimbus AI', hi: 'डैशबोर्ड | Nimbus AI' }
  , 'Crop Advisory | Nimbus AI': { mr: 'पीक सल्ला | Nimbus AI', hi: 'फसल सलाह | Nimbus AI' }
  , 'Login | Nimbus AI': { mr: 'लॉगिन | Nimbus AI', hi: 'लॉगिन | Nimbus AI' }
  , 'Products | Nimbus AI': { mr: 'उत्पादने | Nimbus AI', hi: 'उत्पाद | Nimbus AI' }
  , 'Government Schemes | Nimbus AI': { mr: 'शासकीय योजना | Nimbus AI', hi: 'सरकारी योजनाएँ | Nimbus AI' }
  , 'Profile | Nimbus AI': { mr: 'प्रोफाइल | Nimbus AI', hi: 'प्रोफाइल | Nimbus AI' }
};

const localHosts = new Set(['', 'localhost', '127.0.0.1', '[::1]']);
const localFrontend = localHosts.has(window.location.hostname);
const apiBase = window.NIMBUS_API_BASE || (localFrontend && window.location.port !== '5000' ? 'http://localhost:5000' : '');

window.NimbusApi = {
  url: (path) => `${apiBase}${path}`
};

const getStoredFarmer = () => {
  try {
    return JSON.parse(localStorage.getItem('nimbus-farmer') || '{}');
  } catch {
    return {};
  }
};

const captureVisitorLocation = () => new Promise((resolve) => {
  if (!navigator.geolocation) {
    resolve(null);
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      source: 'browser-consent',
      capturedAt: new Date().toISOString()
    };
    localStorage.setItem('nimbus-location', JSON.stringify(location));
    resolve(location);
  }, () => resolve(null), {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 15000
  });
});

const getVisitorLocation = () => {
  try {
    return JSON.parse(localStorage.getItem('nimbus-location') || 'null');
  } catch {
    return null;
  }
};

const buildWeatherUrl = (endpoint = '/api/weather/current') => {
  const location = getVisitorLocation();
  const params = new URLSearchParams();

  if (Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude)) {
    params.set('lat', location.latitude);
    params.set('lon', location.longitude);
  }

  return params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
};

window.NimbusLocation = {
  capture: captureVisitorLocation,
  get: getVisitorLocation,
  getFarmer: getStoredFarmer,
  buildWeatherUrl
};

const loadTranslationSet = async (lang) => {
  if (translationStore[lang]) return translationStore[lang];

  try {
    const response = await fetch(`translations/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Translation load failed: ${response.status}`);
    }
    const data = await response.json();
    translationStore[lang] = data;
    return data;
  } catch (error) {
    console.warn('Unable to load translation set for', lang, error);
    return {};
  }
};

const applyTranslations = async (notify = true) => {
  const lang = localStorage.getItem('nimbus-language') || 'mr';
  const translations = await loadTranslationSet(lang);

  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const value = translations[key] || el.textContent || '';
    el.textContent = value;
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  const settingsLanguage = document.getElementById('settingsLanguage');
  if (settingsLanguage) settingsLanguage.value = lang;

  document.querySelectorAll('[data-ui-key]').forEach((el) => {
    const value = translations[el.dataset.uiKey];
    if (!value) return;
    const textNode = Array.from(el.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = ` ${value}`;
    else el.textContent = value;
  });

  translateCommonText(lang);
  if (notify) document.dispatchEvent(new CustomEvent('nimbus-language-changed', { detail: { lang } }));
};

const translateCommonText = (lang) => {
  const translateNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!translationSourceTextByNode.has(node)) translationSourceTextByNode.set(node, node.textContent);
      const source = translationSourceTextByNode.get(node);
      const original = source.trim();
      const translation = lang === 'en' ? original : commonTranslations[original]?.[lang];
      if (translation && translation !== original) node.textContent = source.replace(original, translation);
      else if (lang === 'en' && source !== node.textContent) node.textContent = source;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)
      || node.hasAttribute('data-i18n') || node.hasAttribute('data-ui-key')) return;
    node.childNodes.forEach(translateNode);
    ['placeholder', 'aria-label', 'title'].forEach((attribute) => {
      const value = node.getAttribute(attribute);
      if (!value) return;
      let sourceAttributes = translationSourceAttributesByElement.get(node);
      if (!sourceAttributes) {
        sourceAttributes = new Map();
        translationSourceAttributesByElement.set(node, sourceAttributes);
      }
      if (!sourceAttributes.has(attribute)) sourceAttributes.set(attribute, value);
      const source = sourceAttributes.get(attribute);
      const translation = lang === 'en' ? source : commonTranslations[source]?.[lang];
      if (translation) node.setAttribute(attribute, translation);
    });
  };
  translateNode(document.body);
  translateNode(document.head);
};

const translateText = (text, lang = localStorage.getItem('nimbus-language') || 'mr', values = {}) => {
  const template = lang === 'en' ? text : (commonTranslations[text]?.[lang] || text);
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
};

window.NimbusI18n = {
  t: (text, values) => translateText(text, undefined, values),
  lang: () => localStorage.getItem('nimbus-language') || 'mr',
  locale: () => ({ mr: 'mr-IN', hi: 'hi-IN', en: 'en-IN' }[localStorage.getItem('nimbus-language') || 'mr'])
};

const ensureLanguageSwitcher = () => {
  const navKeys = {
    'dashboard.html': 'dashboard',
    'weather.html': 'weather',
    'crop-advisory.html': 'cropAdvisory',
    'schemes.html': 'schemes',
    'products.html': 'products',
    'profile.html': 'profile',
    'login.html': 'logout'
  };
  document.querySelectorAll('.sidebar-nav a').forEach((link) => {
    const key = navKeys[link.getAttribute('href')];
    if (key) link.dataset.uiKey = key;
  });

  const header = document.querySelector('.topbar, .main-header, .page-header, .auth-card');
  if (!header) return;

  let controls = header.querySelector('.page-controls, .header-actions');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'page-controls';
    header.appendChild(controls);
  } else {
    controls.classList.add('page-controls');
  }

  let switcher = header.querySelector('.lang-switcher');
  if (!switcher) {
    switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    const existingButtons = Array.from(controls.querySelectorAll('.lang-btn[data-lang]'));
    if (existingButtons.length) {
      existingButtons.forEach((button) => switcher.appendChild(button));
    } else {
      switcher.innerHTML = '<button class="lang-btn small" type="button" data-lang="mr">मराठी</button><button class="lang-btn small" type="button" data-lang="hi">हिंदी</button><button class="lang-btn small" type="button" data-lang="en">English</button>';
    }
  }
  if (switcher.parentElement !== controls) controls.appendChild(switcher);
};

const setLanguage = async (lang) => {
  localStorage.setItem('nimbus-language', lang);
  await applyTranslations();
};

const applyTheme = (theme) => {
  const selectedTheme = ['light', 'dark', 'system'].includes(theme) ? theme : 'system';
  document.documentElement.dataset.theme = selectedTheme;
  localStorage.setItem('nimbus-theme', selectedTheme);
};

const ensureSettings = () => {
  const controls = document.querySelector('.page-controls');
  if (!controls || document.getElementById('settingsButton')) return;

  const button = document.createElement('button');
  button.id = 'settingsButton';
  button.className = 'btn btn-light settings-button';
  button.type = 'button';
  button.innerHTML = '<i class="fa-solid fa-gear" aria-hidden="true"></i> Settings';
  controls.append(button);

  const modal = document.createElement('div');
  modal.id = 'settingsModal';
  modal.className = 'settings-overlay hidden';
  modal.innerHTML = `
    <section class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
      <div class="card-header">
        <h2 id="settingsTitle">Settings</h2>
        <button class="settings-close" type="button" aria-label="Close settings">&times;</button>
      </div>
      <label>Website language
        <select id="settingsLanguage">
          <option value="mr">मराठी</option>
          <option value="hi">हिंदी</option>
          <option value="en">English</option>
        </select>
      </label>
      <label>Theme
        <select id="settingsTheme">
          <option value="system">Use device setting</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <a class="btn btn-primary settings-contact" href="mailto:vijaycbade@gmail.com?subject=Nimbus%20AI%20support">
        <i class="fa-solid fa-envelope" aria-hidden="true"></i> Contact owner
      </a>
    </section>
  `;
  document.body.append(modal);

  const language = modal.querySelector('#settingsLanguage');
  const theme = modal.querySelector('#settingsTheme');
  const closeButton = modal.querySelector('.settings-close');
  language.value = localStorage.getItem('nimbus-language') || 'mr';
  theme.value = localStorage.getItem('nimbus-theme') || 'system';

  const close = () => modal.classList.add('hidden');
  button.addEventListener('click', () => {
    modal.classList.remove('hidden');
    closeButton.focus();
  });
  closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });
  language.addEventListener('change', () => setLanguage(language.value));
  theme.addEventListener('change', () => applyTheme(theme.value));
};

window.NimbusTranslate = () => applyTranslations(false);

const bindLogout = () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('nimbus-token');
    localStorage.removeItem('nimbus-farmer');
    window.location.href = 'login.html';
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  bindLogout();
  ensureLanguageSwitcher();
  ensureSettings();
  applyTheme(localStorage.getItem('nimbus-theme') || 'system');

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  await applyTranslations();
});
