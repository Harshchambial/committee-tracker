-- Additive public-work itemization. Existing rows remain unchanged unless they
-- match the one verified Shamshan Ghat record and its earlier published total.
alter table public.expenses
  add column if not exists breakdown jsonb;

alter table public.expenses
  drop constraint if exists expenses_breakdown_object;

alter table public.expenses
  add constraint expenses_breakdown_object
  check (breakdown is null or jsonb_typeof(breakdown) = 'object');

update public.expenses
set
  amount = 84310,
  date = '2026-10-05',
  breakdown = $breakdown$
  {
    "sourceTitle": "Gram Vikas Sahayog Samiti detailed expense statement",
    "sourceDocument": "GRAM VIKAS SAHYOG SAMITI.pdf",
    "verifiedThrough": "2026-10-05",
    "previousRecordedTotal": 45945,
    "total": 84310,
    "calculatedItemsTotal": 84660,
    "unreconciledAmount": 350,
    "reconciliationNote": "The statement lists a Documents entry of Rs 350 on 5 October, but the printed stage subtotal and grand total exclude it.",
    "reconciliationNoteHi": "विवरण में 5 अक्टूबर को दस्तावेज़ के ₹350 दर्ज हैं, लेकिन छपे हुए चरण योग और कुल योग में यह राशि शामिल नहीं है।",
    "phases": [
      {
        "title": "Girder installation and rear concrete work",
        "titleHi": "गर्डर लगाने और पीछे सीसी कराने का कार्य",
        "date": "2026-09-08",
        "location": "Shamshan Ghat",
        "subtotal": 29180,
        "items": [
          { "description": "Girder", "descriptionHi": "गर्डर", "amount": 13220 },
          { "description": "Aggregate", "descriptionHi": "बजरी", "amount": 2500 },
          { "description": "Sand and aggregate", "descriptionHi": "रेत और बजरी", "amount": 3000 },
          { "description": "Tempo carriage", "descriptionHi": "टेम्पो भाड़ा", "amount": 1500 },
          { "description": "Concrete mixer", "descriptionHi": "कंक्रीट मिक्सर", "amount": 500 },
          { "description": "Labour", "descriptionHi": "मज़दूरी", "amount": 3300 },
          { "description": "Tea", "descriptionHi": "चाय", "amount": 360 },
          { "description": "Cement - 12 bags", "descriptionHi": "सीमेंट - 12 बैग", "amount": 4500 },
          { "description": "Spray", "descriptionHi": "स्प्रे", "amount": 300 }
        ]
      },
      {
        "title": "Girder reset",
        "titleHi": "गर्डर दोबारा सेट कराया",
        "date": "2026-09-12",
        "location": "Shamshan Ghat",
        "subtotal": 6475,
        "items": [
          { "description": "Labour", "descriptionHi": "मज़दूरी", "amount": 3200 },
          { "description": "OPC cement - 5 bags", "descriptionHi": "ओपीसी सीमेंट - 5 बैग", "amount": 2050 },
          { "description": "Tempo carriage", "descriptionHi": "टेम्पो भाड़ा", "amount": 1000 },
          { "description": "Tea", "descriptionHi": "चाय", "amount": 225 }
        ]
      },
      {
        "title": "Ground leveling and soil filling by JCB",
        "titleHi": "जेसीबी से जगह समतल कर मिट्टी भरवाई",
        "date": "2026-09-12",
        "location": "Shamshan Ghat",
        "subtotal": 10290,
        "items": [
          { "description": "JCB", "descriptionHi": "जेसीबी", "amount": 8200 },
          { "description": "Tractor rent", "descriptionHi": "ट्रैक्टर किराया", "amount": 1800 },
          { "description": "Diesel", "descriptionHi": "डीज़ल", "amount": 50 },
          { "description": "Tea", "descriptionHi": "चाय", "amount": 240 }
        ]
      },
      {
        "title": "Concrete below water tank and body platform construction",
        "titleHi": "पानी की टंकी के नीचे पक्का कार्य और शव रखने का स्थान बनाया",
        "date": "2026-09-20",
        "location": "Shamshan Ghat",
        "subtotal": 20100,
        "items": [
          { "description": "Labour", "descriptionHi": "मज़दूरी", "amount": 3800 },
          { "description": "Concrete mixer", "descriptionHi": "कंक्रीट मिक्सर", "amount": 500 },
          { "description": "Tempo carriage", "descriptionHi": "टेम्पो भाड़ा", "amount": 500 },
          { "description": "Bricks", "descriptionHi": "ईंटें", "amount": 2500 },
          { "description": "Architectural map", "descriptionHi": "वास्तु नक्शा", "amount": 2360 },
          { "description": "Tea", "descriptionHi": "चाय", "amount": 240 },
          { "description": "Sand", "descriptionHi": "रेत", "amount": 3300 },
          { "description": "Aggregate", "descriptionHi": "बजरी", "amount": 2200 },
          { "description": "Cement - 12 bags", "descriptionHi": "सीमेंट - 12 बैग", "amount": 4500 },
          { "description": "Diesel", "descriptionHi": "डीज़ल", "amount": 200 }
        ]
      },
      {
        "title": "Plastering of body platform",
        "titleHi": "शव रखने के स्थान पर प्लास्टर कराया",
        "date": "2026-09-27",
        "location": "Shamshan Ghat",
        "subtotal": 1430,
        "items": [
          { "description": "Soil filling - 2 trips", "descriptionHi": "मिट्टी भराई - 2 फेरे", "amount": 400 },
          { "description": "Labour", "descriptionHi": "मज़दूरी", "amount": 650 },
          { "description": "Cement - 1 bag", "descriptionHi": "सीमेंट - 1 बैग", "amount": 380 }
        ]
      },
      {
        "title": "Character certificate documentation",
        "titleHi": "चरित्र प्रमाणपत्र दस्तावेज़",
        "date": "2026-10-02",
        "location": "Documentation",
        "subtotal": 700,
        "items": [
          { "description": "Character certificate preparation", "descriptionHi": "चरित्र प्रमाणपत्र बनवाया", "amount": 700 }
        ]
      },
      {
        "title": "Water tank ball valve and stand extension",
        "titleHi": "पानी की टंकी में बॉल वाल्व और स्टैंड का विस्तार",
        "date": "2026-10-04",
        "location": "Shamshan Ghat",
        "subtotal": 4005,
        "items": [
          { "description": "Welding work", "descriptionHi": "वेल्डिंग कार्य", "amount": 1300 },
          { "description": "Angle iron 2x2 - weight 23.3 at rate 67", "descriptionHi": "एंगल आयरन 2x2 - वजन 23.3, दर 67", "amount": 1560 },
          { "description": "Carriage from Shamshan Ghat to Beldar", "descriptionHi": "श्मशान घाट से बेलदार तक भाड़ा", "amount": 200 },
          { "description": "Angle iron carriage", "descriptionHi": "एंगल आयरन भाड़ा", "amount": 200 },
          { "description": "MC carriage from Beldar to Shamshan Ghat", "descriptionHi": "बेलदार से श्मशान घाट तक एमसी भाड़ा", "amount": 230 },
          { "description": "1-inch ball and socket for water tank", "descriptionHi": "पानी की टंकी के लिए 1 इंच बॉल और सॉकेट", "amount": 515 }
        ]
      },
      {
        "title": "Tiling of body platform and water tank fitting",
        "titleHi": "शव रखने के स्थान पर टाइल और पानी की टंकी की फिटिंग",
        "date": "2026-10-05",
        "location": "Shamshan Ghat",
        "subtotal": 12130,
        "items": [
          { "description": "Tiles - 13 bundles", "descriptionHi": "टाइल - 13 बंडल", "amount": 1300 },
          { "description": "Tile labour", "descriptionHi": "टाइल मज़दूरी", "amount": 1700 },
          { "description": "Tempo carriage", "descriptionHi": "टेम्पो भाड़ा", "amount": 150 },
          { "description": "Cement - 3 bags", "descriptionHi": "सीमेंट - 3 बैग", "amount": 1155 },
          { "description": "4-inch strip", "descriptionHi": "4 इंच पट्टी", "amount": 20 },
          { "description": "Tea", "descriptionHi": "चाय", "amount": 105 },
          { "description": "Plumber labour", "descriptionHi": "प्लंबर मज़दूरी", "amount": 2000 },
          { "description": "Water tank fitting", "descriptionHi": "पानी की टंकी की फिटिंग", "amount": 5700 },
          { "description": "Documents", "descriptionHi": "दस्तावेज़", "amount": 350, "includedInTotal": false }
        ]
      }
    ]
  }
  $breakdown$::jsonb
where id = 'exp_1789453393710_7qhyu'
  and lower(trim(title)) = 'shamshan ghat'
  and amount = 45945
  and breakdown is null;
