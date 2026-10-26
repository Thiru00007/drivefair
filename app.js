const initialTrips = [
  { id: 1, from: "Home, Velachery", to: "Office, Guindy", date: "Today · 8:42 AM", distanceKm: 7.5, score: 95, event: "", kind: "smooth", duration: "28 min" },
  { id: 2, from: "Guindy", to: "T. Nagar", date: "Yesterday · 6:18 PM", distanceKm: 5, score: 79, event: "Hard braking", kind: "city", duration: "31 min" },
  { id: 3, from: "Velachery", to: "Marina Beach", date: "Oct 18 · 10:05 AM", distanceKm: 12, score: 95, event: "", kind: "smooth", duration: "34 min" },
  { id: 4, from: "Adyar", to: "Velachery", date: "Oct 17 · 9:36 PM", distanceKm: 14, score: 91, event: "", kind: "night", duration: "39 min" }
];

const translations = {
  ta: {
    "Language": "மொழி", "YOUR SPACE": "உங்கள் இடம்", "Overview": "கண்ணோட்டம்", "My trips": "எனது பயணங்கள்", "Claims": "கோரிக்கைகள்", "My coverage": "எனது காப்பீடு", "Privacy & data": "தனியுரிமை மற்றும் தரவு", "Get support": "உதவி பெறுக", "My space": "எனது இடம்", "Your data is protected": "உங்கள் தரவு பாதுகாக்கப்படுகிறது", "Notifications": "அறிவிப்புகள்", "Log a trip": "பயணத்தைப் பதிவு செய்க", "Your driving, your data, your deal. Here's your latest.": "உங்கள் ஓட்டம், உங்கள் தரவு, உங்கள் தேர்வு. சமீபத்திய விவரங்கள்.", "YOUR DRIVE SCORE": "உங்கள் ஓட்ட மதிப்பெண்", "Your premium": "உங்கள் காப்பீட்டுத் தொகை", "YOUR ACTIVITY": "உங்கள் செயல்பாடு", "Your recent trips": "உங்கள் சமீபத்திய பயணங்கள்", "All trips": "அனைத்துப் பயணங்கள்", "Recent trips": "சமீபத்திய பயணங்கள்", "YOUR JOURNEYS": "உங்கள் பயணங்கள்", "Every trip tells a story.": "ஒவ்வொரு பயணமும் ஒரு கதை.", "Distance this month": "இந்த மாதத் தொலைவு", "Trips this month": "இந்த மாதப் பயணங்கள்", "Average trip score": "சராசரிப் பயண மதிப்பெண்", "Careful trips": "கவனமான பயணங்கள்", "Trips with events": "நிகழ்வுகள் உள்ள பயணங்கள்", "HERE TO HELP": "உதவிக்கு இங்கே", "Claims, made simpler.": "கோரிக்கைகள் இப்போது எளிது.", "Start a claim": "கோரிக்கையைத் தொடங்கு", "YOUR CLAIMS": "உங்கள் கோரிக்கைகள்", "Claim activity": "கோரிக்கைச் செயல்பாடு", "COVER THAT FITS YOUR LIFE": "உங்கள் வாழ்க்கைக்கு ஏற்ற காப்பீடு", "Choose how you pay.": "பணம் செலுத்தும் முறையைத் தேர்வுசெய்க.", "FIND YOUR FIT": "உங்களுக்கு ஏற்றதைத் தேர்வுசெய்க", "YOUR DATA, YOUR CALL": "உங்கள் தரவு, உங்கள் முடிவு", "Privacy, in your hands.": "தனியுரிமை உங்கள் கையில்.", "YOUR CONTROLS": "உங்கள் கட்டுப்பாடுகள்", "Data & permissions": "தரவு மற்றும் அனுமதிகள்", "Trip tracking": "பயணக் கண்காணிப்பு", "Precise trip locations": "துல்லியமான பயண இடங்கள்", "Incident assistance": "சம்பவ உதவி", "Vehicle connectivity": "வாகன இணைப்பு", "Export my data": "எனது தரவை ஏற்றுமதி செய்", "Clear demo data": "டெமோ தரவை அழி", "ADD TO YOUR JOURNEYS": "உங்கள் பயணங்களில் சேர்க்கவும்", "Log a sample trip": "மாதிரிப் பயணத்தைப் பதிவு செய்க", "Smooth commute": "சீரான பயணம்", "City errands": "நகரப் பணிகள்", "Evening drive": "மாலைப் பயணம்", "INCIDENT SUPPORT": "சம்பவ உதவி", "Let's start with safety.": "பாதுகாப்புடன் தொடங்குவோம்.", "Yes, everyone is safe": "ஆம், அனைவரும் பாதுகாப்பாக உள்ளனர்", "No, I need emergency help": "இல்லை, எனக்கு அவசர உதவி தேவை", "When did it happen?": "இது எப்போது நடந்தது?", "Collision": "மோதல்", "Vehicle damage": "வாகன சேதம்", "Theft or break-in": "திருட்டு அல்லது உடைப்பு", "Other": "மற்றவை", "Save claim draft": "கோரிக்கை வரைவைச் சேமி", "View claim draft": "கோரிக்கை வரைவைப் பார்", "Close": "மூடு", "Filter trips": "பயணங்களை வடிகட்டு"
  },
  hi: {
    "Language": "भाषा", "YOUR SPACE": "आपकी जगह", "Overview": "अवलोकन", "My trips": "मेरी यात्राएँ", "Claims": "दावे", "My coverage": "मेरा कवरेज", "Privacy & data": "गोपनीयता और डेटा", "Get support": "सहायता पाएँ", "My space": "मेरी जगह", "Your data is protected": "आपका डेटा सुरक्षित है", "Notifications": "सूचनाएँ", "Log a trip": "यात्रा दर्ज करें", "Your driving, your data, your deal. Here's your latest.": "आपकी ड्राइविंग, आपका डेटा, आपकी पसंद। आपकी नई जानकारी।", "YOUR DRIVE SCORE": "आपका ड्राइव स्कोर", "Your premium": "आपका प्रीमियम", "YOUR ACTIVITY": "आपकी गतिविधि", "Your recent trips": "आपकी हाल की यात्राएँ", "All trips": "सभी यात्राएँ", "Recent trips": "हाल की यात्राएँ", "YOUR JOURNEYS": "आपकी यात्राएँ", "Every trip tells a story.": "हर यात्रा की अपनी कहानी है।", "Distance this month": "इस महीने की दूरी", "Trips this month": "इस महीने की यात्राएँ", "Average trip score": "औसत यात्रा स्कोर", "Careful trips": "सावधानीपूर्वक यात्राएँ", "Trips with events": "घटनाओं वाली यात्राएँ", "HERE TO HELP": "हम मदद के लिए हैं", "Claims, made simpler.": "दावों की प्रक्रिया आसान।", "Start a claim": "दावा शुरू करें", "YOUR CLAIMS": "आपके दावे", "Claim activity": "दावा गतिविधि", "COVER THAT FITS YOUR LIFE": "आपकी ज़रूरत के अनुसार कवर", "Choose how you pay.": "भुगतान का तरीका चुनें।", "FIND YOUR FIT": "अपनी पसंद चुनें", "YOUR DATA, YOUR CALL": "आपका डेटा, आपका निर्णय", "Privacy, in your hands.": "गोपनीयता आपके हाथ में।", "YOUR CONTROLS": "आपके नियंत्रण", "Data & permissions": "डेटा और अनुमतियाँ", "Trip tracking": "यात्रा ट्रैकिंग", "Precise trip locations": "यात्रा के सटीक स्थान", "Incident assistance": "घटना सहायता", "Vehicle connectivity": "वाहन कनेक्टिविटी", "Export my data": "मेरा डेटा निर्यात करें", "Clear demo data": "डेमो डेटा मिटाएँ", "ADD TO YOUR JOURNEYS": "अपनी यात्राओं में जोड़ें", "Log a sample trip": "डेमो यात्रा दर्ज करें", "Smooth commute": "सहज सफ़र", "City errands": "शहर के काम", "Evening drive": "शाम की ड्राइव", "INCIDENT SUPPORT": "घटना सहायता", "Let's start with safety.": "पहले सुरक्षा सुनिश्चित करें।", "Yes, everyone is safe": "हाँ, सभी सुरक्षित हैं", "No, I need emergency help": "नहीं, मुझे आपातकालीन सहायता चाहिए", "When did it happen?": "यह कब हुआ?", "Collision": "टक्कर", "Vehicle damage": "वाहन को नुकसान", "Theft or break-in": "चोरी या सेंधमारी", "Other": "अन्य", "Save claim draft": "दावे का ड्राफ्ट सहेजें", "View claim draft": "दावे का ड्राफ्ट देखें", "Close": "बंद करें", "Filter trips": "यात्राएँ फ़िल्टर करें"
  },
  ml: {
    "Language": "ഭാഷ", "YOUR SPACE": "നിങ്ങളുടെ ഇടം", "Overview": "അവലോകനം", "My trips": "എന്റെ യാത്രകൾ", "Claims": "ക്ലെയിമുകൾ", "My coverage": "എന്റെ പരിരക്ഷ", "Privacy & data": "സ്വകാര്യതയും ഡാറ്റയും", "Get support": "സഹായം നേടുക", "My space": "എന്റെ ഇടം", "Your data is protected": "നിങ്ങളുടെ ഡാറ്റ സുരക്ഷിതമാണ്", "Notifications": "അറിയിപ്പുകൾ", "Log a trip": "യാത്ര രേഖപ്പെടുത്തുക", "Your driving, your data, your deal. Here's your latest.": "നിങ്ങളുടെ ഡ്രൈവിംഗ്, ഡാറ്റ, തീരുമാനം. പുതിയ വിവരങ്ങൾ.", "YOUR DRIVE SCORE": "നിങ്ങളുടെ ഡ്രൈവിംഗ് സ്കോർ", "Your premium": "നിങ്ങളുടെ പ്രീമിയം", "YOUR ACTIVITY": "നിങ്ങളുടെ പ്രവർത്തനം", "Your recent trips": "സമീപകാല യാത്രകൾ", "All trips": "എല്ലാ യാത്രകളും", "Recent trips": "സമീപകാല യാത്രകൾ", "YOUR JOURNEYS": "നിങ്ങളുടെ യാത്രകൾ", "Every trip tells a story.": "ഓരോ യാത്രയ്ക്കും ഒരു കഥയുണ്ട്.", "Distance this month": "ഈ മാസത്തെ ദൂരം", "Trips this month": "ഈ മാസത്തെ യാത്രകൾ", "Average trip score": "ശരാശരി യാത്രാ സ്കോർ", "Careful trips": "ശ്രദ്ധാപൂർവമായ യാത്രകൾ", "Trips with events": "സംഭവങ്ങളുള്ള യാത്രകൾ", "HERE TO HELP": "സഹായത്തിന് ഇവിടെ", "Claims, made simpler.": "ക്ലെയിമുകൾ ഇനി ലളിതം.", "Start a claim": "ക്ലെയിം തുടങ്ങുക", "YOUR CLAIMS": "നിങ്ങളുടെ ക്ലെയിമുകൾ", "Claim activity": "ക്ലെയിം പ്രവർത്തനം", "COVER THAT FITS YOUR LIFE": "നിങ്ങളുടെ ജീവിതത്തിന് അനുയോജ്യമായ പരിരക്ഷ", "Choose how you pay.": "പണമടയ്ക്കുന്ന രീതി തിരഞ്ഞെടുക്കുക.", "FIND YOUR FIT": "അനുയോജ്യമായത് തിരഞ്ഞെടുക്കുക", "YOUR DATA, YOUR CALL": "നിങ്ങളുടെ ഡാറ്റ, നിങ്ങളുടെ തീരുമാനം", "Privacy, in your hands.": "സ്വകാര്യത നിങ്ങളുടെ കൈകളിൽ.", "YOUR CONTROLS": "നിങ്ങളുടെ നിയന്ത്രണങ്ങൾ", "Data & permissions": "ഡാറ്റയും അനുമതികളും", "Trip tracking": "യാത്രാ ട്രാക്കിംഗ്", "Precise trip locations": "കൃത്യമായ യാത്രാ ലൊക്കേഷനുകൾ", "Incident assistance": "സംഭവ സഹായം", "Vehicle connectivity": "വാഹന കണക്റ്റിവിറ്റി", "Export my data": "എന്റെ ഡാറ്റ എക്സ്പോർട്ട് ചെയ്യുക", "Clear demo data": "ഡെമോ ഡാറ്റ മായ്ക്കുക", "ADD TO YOUR JOURNEYS": "നിങ്ങളുടെ യാത്രകളിൽ ചേർക്കുക", "Log a sample trip": "സാമ്പിൾ യാത്ര രേഖപ്പെടുത്തുക", "Smooth commute": "സുഗമമായ യാത്ര", "City errands": "നഗര യാത്രകൾ", "Evening drive": "വൈകുന്നേര യാത്ര", "INCIDENT SUPPORT": "സംഭവ സഹായം", "Let's start with safety.": "സുരക്ഷയിൽ നിന്ന് തുടങ്ങാം.", "Yes, everyone is safe": "അതെ, എല്ലാവരും സുരക്ഷിതരാണ്", "No, I need emergency help": "ഇല്ല, അടിയന്തര സഹായം വേണം", "When did it happen?": "ഇത് എപ്പോഴാണ് സംഭവിച്ചത്?", "Collision": "കൂട്ടിയിടി", "Vehicle damage": "വാഹന നാശം", "Theft or break-in": "മോഷണം അല്ലെങ്കിൽ അതിക്രമിച്ച് കടക്കൽ", "Other": "മറ്റുള്ളവ", "Save claim draft": "ക്ലെയിം ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുക", "View claim draft": "ക്ലെയിം ഡ്രാഫ്റ്റ് കാണുക", "Close": "അടയ്ക്കുക", "Filter trips": "യാത്രകൾ ഫിൽട്ടർ ചെയ്യുക"
  },
  te: {
    "Language": "భాష", "YOUR SPACE": "మీ స్థలం", "Overview": "అవలోకనం", "My trips": "నా ప్రయాణాలు", "Claims": "క్లెయిమ్‌లు", "My coverage": "నా కవరేజ్", "Privacy & data": "గోప్యత & డేటా", "Get support": "సహాయం పొందండి", "My space": "నా స్థలం", "Your data is protected": "మీ డేటా సురక్షితం", "Notifications": "నోటిఫికేషన్‌లు", "Log a trip": "ప్రయాణాన్ని నమోదు చేయండి", "Your driving, your data, your deal. Here's your latest.": "మీ డ్రైవింగ్, మీ డేటా, మీ ఎంపిక. తాజా వివరాలు.", "YOUR DRIVE SCORE": "మీ డ్రైవ్ స్కోర్", "Your premium": "మీ ప్రీమియం", "YOUR ACTIVITY": "మీ కార్యకలాపాలు", "Your recent trips": "మీ ఇటీవలి ప్రయాణాలు", "All trips": "అన్ని ప్రయాణాలు", "Recent trips": "ఇటీవలి ప్రయాణాలు", "YOUR JOURNEYS": "మీ ప్రయాణాలు", "Every trip tells a story.": "ప్రతి ప్రయాణం ఒక కథ చెబుతుంది.", "Distance this month": "ఈ నెల దూరం", "Trips this month": "ఈ నెల ప్రయాణాలు", "Average trip score": "సగటు ప్రయాణ స్కోర్", "Careful trips": "జాగ్రత్తగా చేసిన ప్రయాణాలు", "Trips with events": "సంఘటనలతో కూడిన ప్రయాణాలు", "HERE TO HELP": "సహాయం కోసం ఇక్కడ", "Claims, made simpler.": "క్లెయిమ్‌లు ఇప్పుడు సులభం.", "Start a claim": "క్లెయిమ్ ప్రారంభించండి", "YOUR CLAIMS": "మీ క్లెయిమ్‌లు", "Claim activity": "క్లెయిమ్ కార్యకలాపాలు", "COVER THAT FITS YOUR LIFE": "మీ జీవితానికి సరిపోయే కవరేజ్", "Choose how you pay.": "చెల్లింపు విధానాన్ని ఎంచుకోండి.", "FIND YOUR FIT": "మీకు నచ్చినదాన్ని ఎంచుకోండి", "YOUR DATA, YOUR CALL": "మీ డేటా, మీ నిర్ణయం", "Privacy, in your hands.": "గోప్యత మీ చేతుల్లో.", "YOUR CONTROLS": "మీ నియంత్రణలు", "Data & permissions": "డేటా & అనుమతులు", "Trip tracking": "ప్రయాణ ట్రాకింగ్", "Precise trip locations": "ఖచ్చితమైన ప్రయాణ స్థానాలు", "Incident assistance": "సంఘటన సహాయం", "Vehicle connectivity": "వాహన కనెక్టివిటీ", "Export my data": "నా డేటాను ఎగుమతి చేయండి", "Clear demo data": "డెమో డేటాను తొలగించండి", "ADD TO YOUR JOURNEYS": "మీ ప్రయాణాలకు జోడించండి", "Log a sample trip": "నమూనా ప్రయాణాన్ని నమోదు చేయండి", "Smooth commute": "సాఫీ ప్రయాణం", "City errands": "నగర పనులు", "Evening drive": "సాయంత్రం ప్రయాణం", "INCIDENT SUPPORT": "సంఘటన సహాయం", "Let's start with safety.": "భద్రతతో ప్రారంభిద్దాం.", "Yes, everyone is safe": "అవును, అందరూ సురక్షితంగా ఉన్నారు", "No, I need emergency help": "కాదు, నాకు అత్యవసర సహాయం కావాలి", "When did it happen?": "ఇది ఎప్పుడు జరిగింది?", "Collision": "ఢీకొనడం", "Vehicle damage": "వాహన నష్టం", "Theft or break-in": "దొంగతనం లేదా చొరబాటు", "Other": "ఇతర", "Save claim draft": "క్లెయిమ్ ముసాయిదాను సేవ్ చేయండి", "View claim draft": "క్లెయిమ్ ముసాయిదాను చూడండి", "Close": "మూసివేయండి", "Filter trips": "ప్రయాణాలను ఫిల్టర్ చేయండి"
  },
  kn: {
    "Language": "ಭಾಷೆ", "YOUR SPACE": "ನಿಮ್ಮ ಸ್ಥಳ", "Overview": "ಅವಲೋಕನ", "My trips": "ನನ್ನ ಪ್ರಯಾಣಗಳು", "Claims": "ಕ್ಲೇಮ್‌ಗಳು", "My coverage": "ನನ್ನ ವಿಮಾ ರಕ್ಷಣೆ", "Privacy & data": "ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ", "Get support": "ಸಹಾಯ ಪಡೆಯಿರಿ", "My space": "ನನ್ನ ಸ್ಥಳ", "Your data is protected": "ನಿಮ್ಮ ಡೇಟಾ ಸುರಕ್ಷಿತವಾಗಿದೆ", "Notifications": "ಅಧಿಸೂಚನೆಗಳು", "Log a trip": "ಪ್ರಯಾಣ ದಾಖಲಿಸಿ", "Your driving, your data, your deal. Here's your latest.": "ನಿಮ್ಮ ಚಾಲನೆ, ನಿಮ್ಮ ಡೇಟಾ, ನಿಮ್ಮ ಆಯ್ಕೆ. ಇತ್ತೀಚಿನ ವಿವರಗಳು.", "YOUR DRIVE SCORE": "ನಿಮ್ಮ ಚಾಲನಾ ಸ್ಕೋರ್", "Your premium": "ನಿಮ್ಮ ಪ್ರೀಮಿಯಂ", "YOUR ACTIVITY": "ನಿಮ್ಮ ಚಟುವಟಿಕೆ", "Your recent trips": "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಪ್ರಯಾಣಗಳು", "All trips": "ಎಲ್ಲಾ ಪ್ರಯಾಣಗಳು", "Recent trips": "ಇತ್ತೀಚಿನ ಪ್ರಯಾಣಗಳು", "YOUR JOURNEYS": "ನಿಮ್ಮ ಪ್ರಯಾಣಗಳು", "Every trip tells a story.": "ಪ್ರತಿ ಪ್ರಯಾಣವೂ ಒಂದು ಕಥೆ ಹೇಳುತ್ತದೆ.", "Distance this month": "ಈ ತಿಂಗಳ ದೂರ", "Trips this month": "ಈ ತಿಂಗಳ ಪ್ರಯಾಣಗಳು", "Average trip score": "ಸರಾಸರಿ ಪ್ರಯಾಣ ಸ್ಕೋರ್", "Careful trips": "ಎಚ್ಚರಿಕೆಯ ಪ್ರಯಾಣಗಳು", "Trips with events": "ಘಟನೆಗಳಿರುವ ಪ್ರಯಾಣಗಳು", "HERE TO HELP": "ಸಹಾಯಕ್ಕೆ ನಾವು ಇಲ್ಲಿದ್ದೇವೆ", "Claims, made simpler.": "ಕ್ಲೇಮ್‌ಗಳು ಈಗ ಸುಲಭ.", "Start a claim": "ಕ್ಲೇಮ್ ಪ್ರಾರಂಭಿಸಿ", "YOUR CLAIMS": "ನಿಮ್ಮ ಕ್ಲೇಮ್‌ಗಳು", "Claim activity": "ಕ್ಲೇಮ್ ಚಟುವಟಿಕೆ", "COVER THAT FITS YOUR LIFE": "ನಿಮ್ಮ ಜೀವನಕ್ಕೆ ಹೊಂದುವ ರಕ್ಷಣೆ", "Choose how you pay.": "ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.", "FIND YOUR FIT": "ನಿಮಗೆ ಹೊಂದುವುದನ್ನು ಆರಿಸಿ", "YOUR DATA, YOUR CALL": "ನಿಮ್ಮ ಡೇಟಾ, ನಿಮ್ಮ ನಿರ್ಧಾರ", "Privacy, in your hands.": "ಗೌಪ್ಯತೆ ನಿಮ್ಮ ಕೈಯಲ್ಲಿ.", "YOUR CONTROLS": "ನಿಮ್ಮ ನಿಯಂತ್ರಣಗಳು", "Data & permissions": "ಡೇಟಾ ಮತ್ತು ಅನುಮತಿಗಳು", "Trip tracking": "ಪ್ರಯಾಣ ಟ್ರ್ಯಾಕಿಂಗ್", "Precise trip locations": "ನಿಖರ ಪ್ರಯಾಣ ಸ್ಥಳಗಳು", "Incident assistance": "ಘಟನೆ ಸಹಾಯ", "Vehicle connectivity": "ವಾಹನ ಸಂಪರ್ಕ", "Export my data": "ನನ್ನ ಡೇಟಾವನ್ನು ರಫ್ತುಮಾಡಿ", "Clear demo data": "ಡೆಮೊ ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ", "ADD TO YOUR JOURNEYS": "ನಿಮ್ಮ ಪ್ರಯಾಣಗಳಿಗೆ ಸೇರಿಸಿ", "Log a sample trip": "ಮಾದರಿ ಪ್ರಯಾಣ ದಾಖಲಿಸಿ", "Smooth commute": "ಸುಗಮ ಪ್ರಯಾಣ", "City errands": "ನಗರದ ಕೆಲಸಗಳು", "Evening drive": "ಸಂಜೆಯ ಪ್ರಯಾಣ", "INCIDENT SUPPORT": "ಘಟನೆ ಸಹಾಯ", "Let's start with safety.": "ಸುರಕ್ಷತೆಯಿಂದ ಪ್ರಾರಂಭಿಸೋಣ.", "Yes, everyone is safe": "ಹೌದು, ಎಲ್ಲರೂ ಸುರಕ್ಷಿತವಾಗಿದ್ದಾರೆ", "No, I need emergency help": "ಇಲ್ಲ, ನನಗೆ ತುರ್ತು ಸಹಾಯ ಬೇಕು", "When did it happen?": "ಇದು ಯಾವಾಗ ಸಂಭವಿಸಿತು?", "Collision": "ಘರ್ಷಣೆ", "Vehicle damage": "ವಾಹನ ಹಾನಿ", "Theft or break-in": "ಕಳ್ಳತನ ಅಥವಾ ಅತಿಕ್ರಮಣ", "Other": "ಇತರೆ", "Save claim draft": "ಕ್ಲೇಮ್ ಕರಡನ್ನು ಉಳಿಸಿ", "View claim draft": "ಕ್ಲೇಮ್ ಕರಡು ವೀಕ್ಷಿಸಿ", "Close": "ಮುಚ್ಚಿ", "Filter trips": "ಪ್ರಯಾಣಗಳನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ"
  },
  es: {
    "Language": "Idioma", "YOUR SPACE": "TU ESPACIO", "Overview": "Resumen", "My trips": "Mis viajes", "Claims": "Reclamaciones", "My coverage": "Mi cobertura", "Privacy & data": "Privacidad y datos", "Get support": "Obtener ayuda", "My space": "Mi espacio", "Your data is protected": "Tus datos están protegidos", "Notifications": "Notificaciones", "Log a trip": "Registrar un viaje", "Your driving, your data, your deal. Here's your latest.": "Tu conducción, tus datos, tus decisiones. Aquí tienes las novedades.", "YOUR DRIVE SCORE": "TU PUNTUACIÓN DE CONDUCCIÓN", "Your premium": "Tu prima", "YOUR ACTIVITY": "TU ACTIVIDAD", "Your recent trips": "Tus viajes recientes", "All trips": "Todos los viajes", "Recent trips": "Viajes recientes", "YOUR JOURNEYS": "TUS VIAJES", "Every trip tells a story.": "Cada viaje cuenta una historia.", "Distance this month": "Distancia este mes", "Trips this month": "Viajes este mes", "Average trip score": "Puntuación media del viaje", "Careful trips": "Viajes prudentes", "Trips with events": "Viajes con incidentes", "HERE TO HELP": "AQUÍ PARA AYUDARTE", "Claims, made simpler.": "Reclamaciones más sencillas.", "Start a claim": "Iniciar reclamación", "YOUR CLAIMS": "TUS RECLAMACIONES", "Claim activity": "Actividad de reclamaciones", "COVER THAT FITS YOUR LIFE": "COBERTURA PARA TU VIDA", "Choose how you pay.": "Elige cómo pagar.", "FIND YOUR FIT": "ENCUENTRA TU PLAN", "YOUR DATA, YOUR CALL": "TUS DATOS, TU DECISIÓN", "Privacy, in your hands.": "La privacidad está en tus manos.", "YOUR CONTROLS": "TUS CONTROLES", "Data & permissions": "Datos y permisos", "Trip tracking": "Seguimiento de viajes", "Precise trip locations": "Ubicaciones precisas del viaje", "Incident assistance": "Asistencia en incidentes", "Vehicle connectivity": "Conectividad del vehículo", "Export my data": "Exportar mis datos", "Clear demo data": "Borrar datos de demostración", "ADD TO YOUR JOURNEYS": "AÑADIR A TUS VIAJES", "Log a sample trip": "Registrar un viaje de muestra", "Smooth commute": "Trayecto tranquilo", "City errands": "Recados por la ciudad", "Evening drive": "Conducción nocturna", "INCIDENT SUPPORT": "ASISTENCIA EN INCIDENTES", "Let's start with safety.": "Empecemos por la seguridad.", "Yes, everyone is safe": "Sí, todos estamos a salvo", "No, I need emergency help": "No, necesito ayuda de emergencia", "When did it happen?": "¿Cuándo ocurrió?", "Collision": "Colisión", "Vehicle damage": "Daños al vehículo", "Theft or break-in": "Robo o allanamiento", "Other": "Otro", "Save claim draft": "Guardar borrador de reclamación", "View claim draft": "Ver borrador de reclamación", "Close": "Cerrar", "Filter trips": "Filtrar viajes"
  },
  fr: {
    "Language": "Langue", "YOUR SPACE": "VOTRE ESPACE", "Overview": "Vue d’ensemble", "My trips": "Mes trajets", "Claims": "Sinistres", "My coverage": "Ma couverture", "Privacy & data": "Confidentialité et données", "Get support": "Obtenir de l’aide", "My space": "Mon espace", "Your data is protected": "Vos données sont protégées", "Notifications": "Notifications", "Log a trip": "Enregistrer un trajet", "Your driving, your data, your deal. Here's your latest.": "Votre conduite, vos données, vos choix. Voici les dernières nouvelles.", "YOUR DRIVE SCORE": "VOTRE SCORE DE CONDUITE", "Your premium": "Votre prime", "YOUR ACTIVITY": "VOTRE ACTIVITÉ", "Your recent trips": "Vos trajets récents", "All trips": "Tous les trajets", "Recent trips": "Trajets récents", "YOUR JOURNEYS": "VOS TRAJETS", "Every trip tells a story.": "Chaque trajet raconte une histoire.", "Distance this month": "Distance ce mois-ci", "Trips this month": "Trajets ce mois-ci", "Average trip score": "Score moyen des trajets", "Careful trips": "Trajets prudents", "Trips with events": "Trajets avec événements", "HERE TO HELP": "À VOTRE ÉCOUTE", "Claims, made simpler.": "Les sinistres en toute simplicité.", "Start a claim": "Déclarer un sinistre", "YOUR CLAIMS": "VOS SINISTRES", "Claim activity": "Suivi des sinistres", "COVER THAT FITS YOUR LIFE": "UNE COUVERTURE ADAPTÉE À VOTRE VIE", "Choose how you pay.": "Choisissez votre mode de paiement.", "FIND YOUR FIT": "TROUVEZ VOTRE FORMULE", "YOUR DATA, YOUR CALL": "VOS DONNÉES, VOTRE CHOIX", "Privacy, in your hands.": "La confidentialité entre vos mains.", "YOUR CONTROLS": "VOS CONTRÔLES", "Data & permissions": "Données et autorisations", "Trip tracking": "Suivi des trajets", "Precise trip locations": "Lieux précis des trajets", "Incident assistance": "Assistance en cas d’incident", "Vehicle connectivity": "Connectivité du véhicule", "Export my data": "Exporter mes données", "Clear demo data": "Effacer les données de démonstration", "ADD TO YOUR JOURNEYS": "AJOUTER À VOS TRAJETS", "Log a sample trip": "Enregistrer un trajet d’exemple", "Smooth commute": "Trajet fluide", "City errands": "Courses en ville", "Evening drive": "Trajet du soir", "INCIDENT SUPPORT": "ASSISTANCE INCIDENT", "Let's start with safety.": "Commençons par la sécurité.", "Yes, everyone is safe": "Oui, tout le monde est en sécurité", "No, I need emergency help": "Non, j’ai besoin d’aide d’urgence", "When did it happen?": "Quand cela s’est-il produit ?", "Collision": "Collision", "Vehicle damage": "Dommages au véhicule", "Theft or break-in": "Vol ou effraction", "Other": "Autre", "Save claim draft": "Enregistrer le brouillon", "View claim draft": "Voir le brouillon", "Close": "Fermer", "Filter trips": "Filtrer les trajets"
  },
  ar: {
    "Language": "اللغة", "YOUR SPACE": "مساحتك", "Overview": "نظرة عامة", "My trips": "رحلاتي", "Claims": "المطالبات", "My coverage": "تغطيتي", "Privacy & data": "الخصوصية والبيانات", "Get support": "احصل على الدعم", "My space": "مساحتي", "Your data is protected": "بياناتك محمية", "Notifications": "الإشعارات", "Log a trip": "تسجيل رحلة", "Your driving, your data, your deal. Here's your latest.": "قيادتك وبياناتك وخياراتك. إليك آخر المستجدات.", "YOUR DRIVE SCORE": "تقييم قيادتك", "Your premium": "قسطك", "YOUR ACTIVITY": "نشاطك", "Your recent trips": "رحلاتك الأخيرة", "All trips": "كل الرحلات", "Recent trips": "الرحلات الأخيرة", "YOUR JOURNEYS": "رحلاتك", "Every trip tells a story.": "كل رحلة تحكي قصة.", "Distance this month": "المسافة هذا الشهر", "Trips this month": "الرحلات هذا الشهر", "Average trip score": "متوسط تقييم الرحلات", "Careful trips": "الرحلات الآمنة", "Trips with events": "رحلات تضمنت أحداثًا", "HERE TO HELP": "نحن هنا للمساعدة", "Claims, made simpler.": "المطالبات أصبحت أبسط.", "Start a claim": "بدء مطالبة", "YOUR CLAIMS": "مطالباتك", "Claim activity": "نشاط المطالبات", "COVER THAT FITS YOUR LIFE": "تغطية تناسب حياتك", "Choose how you pay.": "اختر طريقة الدفع.", "FIND YOUR FIT": "اختر ما يناسبك", "YOUR DATA, YOUR CALL": "بياناتك، قرارك", "Privacy, in your hands.": "الخصوصية بين يديك.", "YOUR CONTROLS": "إعداداتك", "Data & permissions": "البيانات والأذونات", "Trip tracking": "تتبّع الرحلات", "Precise trip locations": "مواقع الرحلات الدقيقة", "Incident assistance": "المساعدة في الحوادث", "Vehicle connectivity": "اتصال المركبة", "Export my data": "تصدير بياناتي", "Clear demo data": "مسح البيانات التجريبية", "ADD TO YOUR JOURNEYS": "أضف إلى رحلاتك", "Log a sample trip": "تسجيل رحلة تجريبية", "Smooth commute": "تنقل سلس", "City errands": "مشاوير المدينة", "Evening drive": "قيادة مسائية", "INCIDENT SUPPORT": "دعم الحوادث", "Let's start with safety.": "لنبدأ بالسلامة.", "Yes, everyone is safe": "نعم، الجميع بخير", "No, I need emergency help": "لا، أحتاج إلى مساعدة طارئة", "When did it happen?": "متى حدث ذلك؟", "Collision": "تصادم", "Vehicle damage": "أضرار المركبة", "Theft or break-in": "سرقة أو اقتحام", "Other": "أخرى", "Save claim draft": "حفظ مسودة المطالبة", "View claim draft": "عرض مسودة المطالبة", "Close": "إغلاق", "Filter trips": "تصفية الرحلات"
  }
};

const commonTranslations = {
  ta: { "Base coverage": "அடிப்படை காப்பீடு", "Driving & distance": "ஓட்டம் மற்றும் தொலைவு", "Safe driver reward": "பாதுகாப்பான ஓட்டத்திற்கான வெகுமதி", "No events": "நிகழ்வுகள் இல்லை", "Excellent": "சிறப்பு", "out of 100": "100-இல்", "See your full breakdown": "முழு விவரங்களைப் பார்", "Miles driven": "ஓட்டிய மைல்கள்", "Trips completed": "முடித்த பயணங்கள்", "Driving events": "ஓட்ட நிகழ்வுகள்", "Current plan": "தற்போதைய திட்டம்", "Trip details": "பயண விவரங்கள்", "Notifications": "அறிவிப்புகள்", "More account options": "மேலும் கணக்கு விருப்பங்கள்" },
  hi: { "Base coverage": "बेस कवरेज", "Driving & distance": "ड्राइविंग और दूरी", "Safe driver reward": "सुरक्षित ड्राइवर का इनाम", "No events": "कोई घटना नहीं", "Excellent": "उत्कृष्ट", "out of 100": "100 में से", "See your full breakdown": "पूरा विवरण देखें", "Miles driven": "चलाई गई दूरी", "Trips completed": "पूरी की गई यात्राएँ", "Driving events": "ड्राइविंग घटनाएँ", "Current plan": "मौजूदा योजना", "Trip details": "यात्रा विवरण", "Notifications": "सूचनाएँ", "More account options": "खाते के और विकल्प" },
  ml: { "Base coverage": "അടിസ്ഥാന പരിരക്ഷ", "Driving & distance": "ഡ്രൈവിംഗും ദൂരവും", "Safe driver reward": "സുരക്ഷിത ഡ്രൈവർ പ്രതിഫലം", "No events": "സംഭവങ്ങളില്ല", "Excellent": "മികച്ചത്", "out of 100": "100-ൽ", "See your full breakdown": "വിശദമായ കണക്ക് കാണുക", "Miles driven": "ഓടിച്ച മൈലുകൾ", "Trips completed": "പൂർത്തിയാക്കിയ യാത്രകൾ", "Driving events": "ഡ്രൈവിംഗ് സംഭവങ്ങൾ", "Current plan": "നിലവിലെ പ്ലാൻ", "Trip details": "യാത്രാ വിവരങ്ങൾ", "Notifications": "അറിയിപ്പുകൾ", "More account options": "കൂടുതൽ അക്കൗണ്ട് ഓപ്ഷനുകൾ" },
  te: { "Base coverage": "ప్రాథమిక కవరేజ్", "Driving & distance": "డ్రైవింగ్ & దూరం", "Safe driver reward": "సురక్షిత డ్రైవర్ బహుమతి", "No events": "సంఘటనలు లేవు", "Excellent": "అద్భుతం", "out of 100": "100లో", "See your full breakdown": "పూర్తి వివరాలను చూడండి", "Miles driven": "నడిపిన మైళ్లు", "Trips completed": "పూర్తయిన ప్రయాణాలు", "Driving events": "డ్రైవింగ్ సంఘటనలు", "Current plan": "ప్రస్తుత ప్లాన్", "Trip details": "ప్రయాణ వివరాలు", "Notifications": "నోటిఫికేషన్‌లు", "More account options": "మరిన్ని ఖాతా ఎంపికలు" },
  kn: { "Base coverage": "ಮೂಲ ವಿಮಾ ರಕ್ಷಣೆ", "Driving & distance": "ಚಾಲನೆ ಮತ್ತು ದೂರ", "Safe driver reward": "ಸುರಕ್ಷಿತ ಚಾಲನೆ ಬಹುಮಾನ", "No events": "ಘಟನೆಗಳಿಲ್ಲ", "Excellent": "ಅತ್ಯುತ್ತಮ", "out of 100": "100ರಲ್ಲಿ", "See your full breakdown": "ಪೂರ್ಣ ವಿವರ ನೋಡಿ", "Miles driven": "ಚಾಲಿಸಿದ ಮೈಲುಗಳು", "Trips completed": "ಪೂರ್ಣಗೊಂಡ ಪ್ರಯಾಣಗಳು", "Driving events": "ಚಾಲನಾ ಘಟನೆಗಳು", "Current plan": "ಪ್ರಸ್ತುತ ಯೋಜನೆ", "Trip details": "ಪ್ರಯಾಣದ ವಿವರಗಳು", "Notifications": "ಅಧಿಸೂಚನೆಗಳು", "More account options": "ಹೆಚ್ಚಿನ ಖಾತೆ ಆಯ್ಕೆಗಳು" },
  es: { "Base coverage": "Cobertura base", "Driving & distance": "Conducción y distancia", "Safe driver reward": "Recompensa por conducción segura", "No events": "Sin incidentes", "Excellent": "Excelente", "out of 100": "de 100", "See your full breakdown": "Ver el desglose completo", "Miles driven": "Millas recorridas", "Trips completed": "Viajes completados", "Driving events": "Incidentes de conducción", "Current plan": "Plan actual", "Trip details": "Detalles del viaje", "Notifications": "Notificaciones", "More account options": "Más opciones de cuenta" },
  fr: { "Base coverage": "Couverture de base", "Driving & distance": "Conduite et distance", "Safe driver reward": "Récompense de conduite prudente", "No events": "Aucun événement", "Excellent": "Excellent", "out of 100": "sur 100", "See your full breakdown": "Voir le détail complet", "Miles driven": "Miles parcourus", "Trips completed": "Trajets effectués", "Driving events": "Événements de conduite", "Current plan": "Formule actuelle", "Trip details": "Détails du trajet", "Notifications": "Notifications", "More account options": "Plus d’options du compte" },
  ar: { "Base coverage": "التغطية الأساسية", "Driving & distance": "القيادة والمسافة", "Safe driver reward": "مكافأة القيادة الآمنة", "No events": "لا توجد أحداث", "Excellent": "ممتاز", "out of 100": "من 100", "See your full breakdown": "عرض التفاصيل الكاملة", "Miles driven": "الأميال المقطوعة", "Trips completed": "الرحلات المكتملة", "Driving events": "أحداث القيادة", "Current plan": "الخطة الحالية", "Trip details": "تفاصيل الرحلة", "Notifications": "الإشعارات", "More account options": "المزيد من خيارات الحساب" }
};
Object.entries(commonTranslations).forEach(([language, dictionary]) => Object.assign(translations[language], dictionary));

const samples = {
  smooth: { from: "Velachery", to: "Guindy", distanceKm: 19, event: "", kind: "smooth", duration: "26 min", date: "Just now", signals: { hardBrakes: 0, rapidAcceleration: 0, sharpTurns: 0, nightDriving: false } },
  mixed: { from: "T. Nagar", to: "Velachery", distanceKm: 13, event: "Hard braking", kind: "city", duration: "24 min", date: "Just now", signals: { hardBrakes: 1, rapidAcceleration: 0, sharpTurns: 0, nightDriving: false } },
  night: { from: "Adyar", to: "Velachery", distanceKm: 29, event: "", kind: "night", duration: "37 min", date: "Just now", signals: { hardBrakes: 0, rapidAcceleration: 0, sharpTurns: 0, nightDriving: true } }
};

const storageKey = "drivefair-demo-v1";
const defaultState = {
  addedTrips: [],
  claims: [],
  language: "en",
  theme: "soft",
  accent: "green",
  textSize: "normal",
  plan: "mile",
  tracking: true,
  preciseLocations: true,
  incidentAssistance: true
};
let storageReadFailed = false;
let state = loadState();
let toastTimer;
const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();

function localizePage() {
  const language = state.language || "en";
  const dictionary = translations[language] || {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = originalTextNodes.get(node) || node.nodeValue;
    originalTextNodes.set(node, original);
    const trimmed = original.trim();
    if (trimmed && dictionary[trimmed]) {
      node.nodeValue = original.replace(trimmed, dictionary[trimmed]);
    } else {
      node.nodeValue = original;
    }
  }
  document.querySelectorAll("[aria-label], [title], [placeholder]").forEach(element => {
    const attributes = originalAttributes.get(element) || {};
    ["aria-label", "title", "placeholder"].forEach(name => {
      if (!Object.prototype.hasOwnProperty.call(attributes, name)) {
        attributes[name] = element.getAttribute(name);
      }
      const original = attributes[name];
      if (original && dictionary[original]) element.setAttribute(name, dictionary[original]);
      else if (original) element.setAttribute(name, original);
    });
    originalAttributes.set(element, attributes);
  });
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  const picker = document.getElementById("language-select");
  if (picker) picker.value = language;
}

function applyAppearance() {
  document.body.dataset.theme = state.theme;
  document.body.dataset.accent = state.accent;
  document.body.dataset.textSize = state.textSize;
  document.getElementById("theme-select").value = state.theme;
  document.getElementById("accent-select").value = state.accent;
  document.getElementById("text-size-select").value = state.textSize;
  document.querySelector('meta[name="theme-color"]').content =
    state.theme === "dark" ? "#080a16" : state.theme === "soft" ? "#f2efe7" : "#f5f6f3";
}

function freshDefaultState() {
  return { ...defaultState, addedTrips: [], claims: [] };
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return freshDefaultState();
    const parsed = JSON.parse(raw);
    const addedTrips = Array.isArray(parsed.addedTrips) ? parsed.addedTrips
      .filter(trip => trip && Number.isFinite(trip.id) && (Number.isFinite(trip.distanceKm) || Number.isFinite(trip.miles)) && Number.isFinite(trip.score) &&
        typeof trip.from === "string" && typeof trip.to === "string" && typeof trip.date === "string" &&
        typeof trip.duration === "string" && typeof trip.event === "string")
      .map(trip => {
        const { miles, ...rest } = trip;
        return {
          ...rest,
          distanceKm: Math.max(0, Number.isFinite(trip.distanceKm) ? trip.distanceKm : miles * 1.60934),
          score: Math.max(0, Math.min(100, trip.score)),
          kind: ["smooth", "city", "night"].includes(trip.kind) ? trip.kind : "smooth"
        };
      }) : [];
    const claims = Array.isArray(parsed.claims) ? parsed.claims
      .filter(claim => claim && typeof claim.id === "string" && typeof claim.date === "string" && claim.status === "Draft")
      .map(claim => ({
        ...claim,
        type: typeof claim.type === "string" ? claim.type : "Incident report",
        details: typeof claim.details === "string" ? claim.details : "",
        tripSummaryIncluded: claim.tripSummaryIncluded === true,
        tripSummary: claim.tripSummary && (Number.isFinite(claim.tripSummary.distanceKm) || Number.isFinite(claim.tripSummary.miles)) && Number.isFinite(claim.tripSummary.score)
          ? { distanceKm: Math.max(0, Number.isFinite(claim.tripSummary.distanceKm) ? claim.tripSummary.distanceKm : claim.tripSummary.miles * 1.60934), score: Math.max(0, Math.min(100, claim.tripSummary.score)), event: typeof claim.tripSummary.event === "string" ? claim.tripSummary.event : "No events" }
          : null
      })) : [];
    return {
      ...freshDefaultState(),
      addedTrips,
      claims,
      language: ["en", "ta", "hi", "ml", "te", "kn", "es", "fr", "ar"].includes(parsed.language) ? parsed.language : defaultState.language,
      theme: ["light", "soft", "dark"].includes(parsed.theme) ? parsed.theme : defaultState.theme,
      accent: ["green", "blue", "violet", "rose", "amber"].includes(parsed.accent) ? parsed.accent : defaultState.accent,
      textSize: ["normal", "large", "largest"].includes(parsed.textSize) ? parsed.textSize : defaultState.textSize,
      plan: ["mile", "journey", "monthly"].includes(parsed.plan) ? parsed.plan : defaultState.plan,
      tracking: typeof parsed.tracking === "boolean" ? parsed.tracking : defaultState.tracking,
      preciseLocations: typeof parsed.preciseLocations === "boolean" ? parsed.preciseLocations : defaultState.preciseLocations,
      incidentAssistance: typeof parsed.incidentAssistance === "boolean" ? parsed.incidentAssistance : defaultState.incidentAssistance
    };
  } catch (error) {
    console.error("Unable to read saved DriveFair demo data.", error);
    storageReadFailed = true;
    return freshDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Unable to save DriveFair demo data.", error);
    showToast("Your browser couldn't save this change. It may not persist after you leave.");
    return false;
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  localizePage();
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3300);
}

function allTrips() {
  return [...state.addedTrips, ...initialTrips];
}

function scoreTrip(signals) {
  const penalties = signals.hardBrakes * 16 + signals.rapidAcceleration * 8 + signals.sharpTurns * 10 + (signals.nightDriving ? 4 : 0);
  return Math.max(0, Math.min(100, 95 - penalties));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function explainTripScore(trip) {
  if (!trip.factors) return `${trip.event || "No events"} noted in the sample trip record.`;
  const { hardBrakes, rapidAcceleration, sharpTurns, nightDriving } = trip.factors;
  const deductions = [];
  if (hardBrakes) deductions.push(`${hardBrakes} hard braking × −16`);
  if (rapidAcceleration) deductions.push(`${rapidAcceleration} rapid acceleration × −8`);
  if (sharpTurns) deductions.push(`${sharpTurns} sharp turns × −10`);
  if (nightDriving) deductions.push("evening driving −4");
  return deductions.length ? deductions.join(", ") : "No modeled events; 95-point starting score.";
}

function formatMoney(value) {
  return `₹${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
}

function formatAdjustment(value) {
  if (value < 0) return `−${formatMoney(Math.abs(value))}`;
  if (value > 0) return `+${formatMoney(value)}`;
  return formatMoney(0);
}

function getEstimate(plan = state.plan) {
  const trips = allTrips();
  const distanceKm = 621 + state.addedTrips.reduce((sum, trip) => sum + trip.distanceKm, 0);
  const tripCount = 24 + state.addedTrips.length;
  const averageScore = Math.round(trips.reduce((sum, trip) => sum + trip.score, 0) / trips.length);
  const scoreAdjustment = Math.max(-100, Math.min(200, (85 - averageScore) * 5));
  const reward = 50;
  const adjustmentLine = { scoreAdjustment, averageScore };
  if (plan === "journey") return { total: Math.max(0, 199 + tripCount * 20 + scoreAdjustment - reward), base: 199, usage: tripCount * 20, usageLabel: `${tripCount} trips × ₹20`, reward, name: "Pay per trip", desc: "A base rate plus a clear price for each trip.", ...adjustmentLine };
  if (plan === "monthly") return { total: Math.max(0, 699 + scoreAdjustment - reward), base: 699, usage: 0, usageLabel: "Included in monthly rate", reward, name: "Predictable monthly", desc: "One steady monthly price, with rewards for safer driving.", ...adjustmentLine };
  return { total: Math.max(0, 199 + distanceKm * 1.5 + scoreAdjustment - reward), base: 199, usage: distanceKm * 1.5, usageLabel: `${distanceKm.toFixed(1)} km × ₹1.50`, reward, name: "Pay per kilometre", desc: "A base rate plus the kilometres you actually drive.", ...adjustmentLine };
}

function renderTrip(trip, compact = false) {
  const location = state.preciseLocations ? `${escapeHtml(trip.from)} <span>→</span> ${escapeHtml(trip.to)}` : "Private trip · distance and score only";
  const safeClass = trip.score < 80 ? "mid" : "";
  const event = trip.event ? `<span class="event-badge">${escapeHtml(trip.event)}</span>` : '<span class="event-badge event-clear">No events</span>';
  return `<div class="trip-row" data-trip-id="${trip.id}">
    <div class="trip-place"><span class="trip-route-icon ${trip.kind === "city" ? "city" : ""} ${trip.kind === "night" ? "night" : ""}">⌁</span><div><strong>${location}</strong><span>${escapeHtml(trip.date)}</span></div></div>
    <span class="trip-meta">${escapeHtml(trip.duration)}</span>
    <span class="trip-score ${safeClass}">${trip.score}</span>
    ${compact ? `<span class="trip-distance">${trip.distanceKm} km</span>` : `<span>${event}</span><span class="trip-distance">${trip.distanceKm} km</span>`}
    <button class="trip-detail-button" data-trip-detail="${trip.id}" aria-label="Trip details">→</button>
  </div>`;
}

function renderTrips() {
  const trips = allTrips();
  const recent = document.getElementById("recent-trips");
  const allList = document.getElementById("all-trips");
  recent.innerHTML = trips.slice(0, 3).map(trip => renderTrip(trip, true)).join("");
  const filter = document.getElementById("trip-filter").value;
  const visible = trips.filter(trip => {
    if (filter === "careful") return trip.score >= 85;
    if (filter === "events") return Boolean(trip.event);
    return true;
  });
  allList.innerHTML = '<div class="trip-row trip-table-head"><span>JOURNEY</span><span>DURATION</span><span>SCORE</span><span>EVENTS</span><span>DISTANCE</span></div>' +
    (visible.length ? visible.map(trip => renderTrip(trip)).join("") : '<div class="empty-state">No trips match this filter. Try another view.</div>');
  document.getElementById("miles-stat").innerHTML = `${(621 + state.addedTrips.reduce((sum, trip) => sum + trip.distanceKm, 0)).toFixed(1)} <small>km</small>`;
  document.getElementById("trip-count").textContent = 24 + state.addedTrips.length;
  document.getElementById("trip-miles-summary").textContent = `${(621 + state.addedTrips.reduce((sum, trip) => sum + trip.distanceKm, 0)).toFixed(1)} km`;
  document.getElementById("trip-number-summary").textContent = `${24 + state.addedTrips.length} trips`;
  document.getElementById("event-count").textContent = 2 + state.addedTrips.filter(trip => trip.event).length;
  const averageScore = Math.round(trips.reduce((sum, trip) => sum + trip.score, 0) / trips.length);
  document.getElementById("average-score-summary").textContent = `${averageScore} / 100`;
  document.getElementById("drive-score").textContent = averageScore;
  document.querySelector(".score-ring").setAttribute("aria-label", `Driving score ${averageScore} out of 100`);
  document.querySelector(".score-ring").style.setProperty("--score-angle", `${averageScore * 3.6}deg`);
  document.querySelector(".score-track span").style.width = `${averageScore}%`;
  renderPremium();
  localizePage();
}

function renderPremium() {
  const estimate = getEstimate();
  const [whole, cents] = estimate.total.toFixed(2).split(".");
  document.getElementById("premium-total").textContent = new Intl.NumberFormat("en-IN").format(Number(whole));
  document.querySelector(".amount-cents").textContent = `.${cents}`;
  document.getElementById("pricing-total").textContent = formatMoney(estimate.total);
  document.getElementById("selected-plan-name").textContent = estimate.name;
  document.getElementById("selected-plan-desc").textContent = estimate.desc;
  document.querySelector(".mini-breakdown").innerHTML = `<div><span>Base coverage</span><strong>${formatMoney(estimate.base)}</strong></div>
    <div><span>Driving & distance</span><strong>${formatMoney(estimate.usage)}</strong></div>
    <div><span>Trip score adjustment · avg ${estimate.averageScore}</span><strong>${formatAdjustment(estimate.scoreAdjustment)}</strong></div>
    <div class="discount-row"><span>Safe driver reward</span><strong>−${formatMoney(estimate.reward)}</strong></div>`;
  const breakdown = document.querySelector(".pricing-breakdown");
  breakdown.innerHTML = `<div><span>Base coverage</span><strong>${formatMoney(estimate.base)}</strong></div>
    <div><span>${estimate.usageLabel}</span><strong>${formatMoney(estimate.usage)}</strong></div>
    <div><span>Trip score adjustment · avg ${estimate.averageScore}/100</span><strong>${formatAdjustment(estimate.scoreAdjustment)}</strong></div>
    <div><span>Safe driver reward</span><strong class="green-text">−${formatMoney(estimate.reward)}</strong></div>
    <div class="breakdown-total"><span>Estimated monthly total</span><strong>${formatMoney(estimate.total)}</strong></div>`;
  document.querySelectorAll(".plan-card").forEach(card => {
    const selected = card.dataset.plan === state.plan;
    card.classList.toggle("selected", selected);
    card.querySelector(".plan-select-button").textContent = selected ? "Current plan" : "See this plan";
  });
  localizePage();
}

function renderClaims() {
  const count = state.claims.filter(claim => claim.status === "Draft").length;
  document.getElementById("claim-count").textContent = count || "";
  const list = document.getElementById("claim-list");
  if (!state.claims.length) {
    list.innerHTML = '<div class="claim-list-empty"><span class="claim-empty-icon">✓</span><div><strong>No claims in progress</strong><p>If something happens, start a claim when you feel ready. We’ll guide you through it.</p></div></div>';
    localizePage();
    return;
  }
  list.innerHTML = state.claims.map(claim => {
    const summary = claim.tripSummary
      ? ` · Trip summary: ${claim.tripSummary.distanceKm} km, score ${claim.tripSummary.score}/100, ${escapeHtml(claim.tripSummary.event)}`
      : "";
    return `<div class="claim-entry"><span class="claim-status-icon">▤</span><div class="claim-entry-details"><strong>${escapeHtml(claim.id)} · ${escapeHtml(claim.type)}</strong><p>${escapeHtml(claim.date)} · ${escapeHtml(claim.details || "Draft saved for your review")}${summary}</p></div><span class="claim-status">Draft</span></div>`;
  }).join("");
  localizePage();
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => section.classList.toggle("active", section.id === `page-${page}`));
  document.querySelectorAll(".nav-item[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  const pageNames = { overview: "Overview", trips: "My trips", claims: "Claims", pricing: "My coverage", privacy: "Privacy & data" };
  document.getElementById("breadcrumb-current").textContent = pageNames[page] || "Overview";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addSampleTrip(kind) {
  if (!state.tracking) {
    document.getElementById("trip-dialog").close();
    showToast("Trip tracking is paused. Turn it on in Privacy & data to log a sample trip.");
    return;
  }
  const sample = samples[kind];
  const trip = { ...sample, score: scoreTrip(sample.signals), factors: sample.signals, id: Date.now() };
  state.addedTrips.unshift(trip);
  if (!saveState()) {
    state.addedTrips.shift();
    return;
  }
  renderTrips();
  document.getElementById("trip-dialog").close();
  showToast(`Trip added · Drive score ${trip.score}. ${trip.event ? `${trip.event} affected the score.` : "Smooth driving, no events detected."}`);
}

function startClaim() {
  const dialog = document.getElementById("claim-dialog");
  document.getElementById("claim-details").reset();
  document.getElementById("incident-description").setCustomValidity("");
  document.getElementById("incident-date").value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById("claim-details").hidden = true;
  document.getElementById("claim-success").hidden = true;
  dialog.querySelector(".claim-modal > .eyebrow").textContent = "INCIDENT SUPPORT";
  dialog.querySelector(".claim-modal > h2").textContent = "Let's start with safety.";
  dialog.querySelector(".claim-modal > .modal-description").textContent = "Are you and everyone involved safe right now?";
  dialog.querySelector(".safety-actions").hidden = false;
  dialog.querySelector(".modal-footnote").hidden = false;
  dialog.showModal();
}

document.querySelectorAll(".nav-item[data-page]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
document.getElementById("new-trip-button").addEventListener("click", () => document.getElementById("trip-dialog").showModal());
document.getElementById("trips-log-button").addEventListener("click", () => document.getElementById("trip-dialog").showModal());
document.querySelectorAll("[data-sample]").forEach(button => button.addEventListener("click", () => addSampleTrip(button.dataset.sample)));
document.getElementById("trip-filter").addEventListener("change", renderTrips);
document.getElementById("language-select").addEventListener("change", event => {
  state.language = event.currentTarget.value;
  if (!saveState()) {
    state.language = defaultState.language;
    event.currentTarget.value = state.language;
  }
  localizePage();
  renderTrips();
  renderClaims();
});
document.getElementById("theme-select").addEventListener("change", event => {
  const previousTheme = state.theme;
  state.theme = event.currentTarget.value;
  if (!saveState()) {
    state.theme = previousTheme;
    event.currentTarget.value = previousTheme;
    return;
  }
  applyAppearance();
});
document.getElementById("accent-select").addEventListener("change", event => {
  const previousAccent = state.accent;
  state.accent = event.currentTarget.value;
  if (!saveState()) {
    state.accent = previousAccent;
    event.currentTarget.value = previousAccent;
    return;
  }
  applyAppearance();
});
document.getElementById("text-size-select").addEventListener("change", event => {
  const previousTextSize = state.textSize;
  state.textSize = event.currentTarget.value;
  if (!saveState()) {
    state.textSize = previousTextSize;
    event.currentTarget.value = previousTextSize;
    return;
  }
  applyAppearance();
});
document.querySelectorAll("[data-select-plan]").forEach(button => button.addEventListener("click", () => {
  const previousPlan = state.plan;
  state.plan = button.dataset.selectPlan;
  if (!saveState()) {
    state.plan = previousPlan;
    renderPremium();
    return;
  }
  renderPremium();
  showToast(`Plan preview updated to ${getEstimate().name}. This is a demo estimate, not a policy change.`);
}));
document.getElementById("start-claim-button").addEventListener("click", startClaim);
document.getElementById("safe-button").addEventListener("click", () => {
  document.querySelector(".safety-actions").hidden = true;
  document.querySelector(".claim-modal > .modal-footnote").hidden = true;
  document.getElementById("claim-details").hidden = false;
});
document.getElementById("incident-description").addEventListener("input", event => event.currentTarget.setCustomValidity(""));
document.getElementById("claim-details").addEventListener("submit", event => {
  event.preventDefault();
  const description = document.getElementById("incident-description");
  description.setCustomValidity("");
  if (!description.value.trim()) {
    description.setCustomValidity("Please add a short description, or enter 'Not sure yet'.");
    description.reportValidity();
    return;
  }
  const nextNumber = state.claims.length + 1;
  const incidentDate = new Date(document.getElementById("incident-date").value);
  const date = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(incidentDate);
  const tripSummaryIncluded = document.getElementById("include-trip-summary").checked;
  const latestTrip = allTrips()[0];
  const claim = {
    id: `DF-DRAFT-${String(nextNumber).padStart(3, "0")}`,
    date,
    type: document.getElementById("incident-type").value,
    details: description.value.trim(),
    tripSummaryIncluded,
    tripSummary: tripSummaryIncluded ? {
      distanceKm: latestTrip.distanceKm,
      score: latestTrip.score,
      event: latestTrip.event || "No detected events"
    } : null,
    status: "Draft"
  };
  state.claims.unshift(claim);
  if (!saveState()) {
    state.claims.shift();
    renderClaims();
    return;
  }
  renderClaims();
  document.querySelector(".claim-modal > .eyebrow").textContent = "DRAFT SAVED";
  document.querySelector(".claim-modal > h2").textContent = "You're in control from here.";
  document.querySelector(".claim-modal > .modal-description").textContent = "Your claim draft is ready. It has not been submitted.";
  document.getElementById("claim-details").hidden = true;
  document.getElementById("claim-success-copy").textContent = claim.tripSummaryIncluded
    ? "Your draft and optional trip summary are saved locally. Nothing has been sent to an insurer."
    : "Your draft is saved locally. No trip summary was attached, and nothing has been sent to an insurer.";
  document.getElementById("claim-success").hidden = false;
});
document.getElementById("emergency-button").addEventListener("click", () => {
  showToast("Please call your local emergency number now. DriveFair cannot contact emergency services.");
});
document.getElementById("finish-claim-button").addEventListener("click", () => {
  document.getElementById("claim-dialog").close();
  navigate("claims");
});
document.getElementById("help-button").addEventListener("click", () => showToast("Support demo: a real insurer would connect you with its support team here."));
document.querySelector(".notification-button").addEventListener("click", () => showToast("You're all caught up. No new notifications."));
document.getElementById("tracking-toggle").addEventListener("change", event => {
  const previous = state.tracking;
  state.tracking = event.target.checked;
  if (!saveState()) {
    state.tracking = previous;
    event.target.checked = previous;
    return;
  }
  showToast(state.tracking ? "Trip tracking is on." : "Trip tracking is paused. You can still browse your saved trips.");
});
document.getElementById("location-toggle").addEventListener("change", event => {
  const previous = state.preciseLocations;
  state.preciseLocations = event.target.checked;
  if (!saveState()) {
    state.preciseLocations = previous;
    event.target.checked = previous;
    return;
  }
  renderTrips();
  showToast(state.preciseLocations ? "Precise trip locations are visible in this demo." : "Trip locations hidden. Distance and scores remain visible.");
});
document.getElementById("incident-toggle").addEventListener("change", event => {
  const previous = state.incidentAssistance;
  state.incidentAssistance = event.target.checked;
  if (!saveState()) {
    state.incidentAssistance = previous;
    event.target.checked = previous;
    return;
  }
  showToast(state.incidentAssistance ? "Incident assistance is on." : "Incident assistance is off. You can still start a claim manually.");
});
document.getElementById("export-button").addEventListener("click", () => {
  const trips = state.preciseLocations
    ? allTrips()
    : allTrips().map(trip => ({ distanceKm: trip.distanceKm, score: trip.score }));
  const exportData = { exportedAt: new Date().toISOString(), note: "DriveFair hackathon demo data; not an insurance record.", preferences: { tracking: state.tracking, preciseLocations: state.preciseLocations, incidentAssistance: state.incidentAssistance }, plan: state.plan, trips, claims: state.claims };
  const file = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "drivefair-demo-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Your demo data export has been downloaded.");
});
document.getElementById("delete-button").addEventListener("click", () => {
  if (!window.confirm("Clear locally saved demo trips, claim drafts, and preferences? This restores the sample starting view.")) return;
  const previousState = state;
  state = freshDefaultState();
  if (!saveState()) {
    state = previousState;
    return;
  }
  document.getElementById("tracking-toggle").checked = true;
  document.getElementById("location-toggle").checked = true;
  document.getElementById("incident-toggle").checked = true;
  document.getElementById("language-select").value = state.language;
  applyAppearance();
  localizePage();
  renderTrips();
  renderClaims();
  localizePage();
  storageReadFailed = false;
  showToast("Your saved demo changes were cleared. Sample starting data is still shown.");
});
document.getElementById("all-trips").addEventListener("click", event => {
  const button = event.target.closest("[data-trip-detail]");
  if (!button) return;
  const trip = allTrips().find(item => String(item.id) === button.dataset.tripDetail);
  if (trip) showToast(`${trip.distanceKm} km · ${trip.duration} · score ${trip.score}/100 · ${explainTripScore(trip)}. Guidance only, not a fault assessment.`);
});
document.getElementById("recent-trips").addEventListener("click", event => {
  const button = event.target.closest("[data-trip-detail]");
  if (!button) return;
  const trip = allTrips().find(item => String(item.id) === button.dataset.tripDetail);
  if (trip) showToast(`${trip.distanceKm} km · ${trip.duration} · score ${trip.score}/100 · ${explainTripScore(trip)}. Guidance only, not a fault assessment.`);
});

document.getElementById("tracking-toggle").checked = state.tracking;
document.getElementById("location-toggle").checked = state.preciseLocations;
document.getElementById("incident-toggle").checked = state.incidentAssistance;
applyAppearance();
renderTrips();
renderClaims();
