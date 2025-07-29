const governorates = [
    {
      "name": "Abyan",
      "cities": ["Zinjibar", "Khanfar", "Lawdar", "Modiyah", "Sibah", "Ahwar"]
    },
    {
      "name": "Aden",
      "cities": ["Crater", "Mualla", "Tawahi", "Sheikh Othman", "Mansoura", "Dar Saad", "Al Buraiqa", "Khour Maksar"]
    },
    {
      "name": "Al Bayda",
      "cities": ["Al Bayda", "Radaa", "Mukayris", "Nati", "Sabah", "Wald Rabi", "As Sawmaah", "Az Zahir"]
    },
    {
      "name": "Al Dhale'e",
      "cities": ["Al Dhale'e", "Damt", "Qa'tabah", "Al Azariq", "Jahaf", "Al Hussein", "Al Shu'ayb", "Juban"]
    },
    {
      "name": "Al Hudaydah",
      "cities": ["Al Hudaydah", "Bajil", "Al Khawkhah", "Al Luhayyah", "As Salif", "Bayt Al Faqih", "Zabid", "Al Mansuriyah", "At Tuhayat", "Hays", "Al Mighlaf", "Al Jarahi", "Kamaran", "Ad Durayhimi", "Al Qanawis", "Wadi Mawr", "Az Zaydiyah", "At Tuhayta", "Al Khawkhah", "Harf Sufyan", "Ash Shamayatayn", "Al Marawiah", "Bura"]
    },
    {
      "name": "Al Jawf",
      "cities": ["Al Hazm", "Khab wa ash Sha'af", "Bart Al Anan", "Al Khalq", "Al Matammah", "Al Ghayl", "Rajuzah", "Az Zahir", "Al Humaydat", "Khabb wa ash Sha'af", "Al Maton"]
    },
    {
      "name": "Al Mahrah",
      "cities": ["Al Ghaydah", "Sayhut", "Qishn", "Al Masilah", "Hawf", "Man'ar", "Shahan", "Haswayn", "Fartak"]
    },
    {
      "name": "Al Mahwit",
      "cities": ["Al Mahwit", "Al Khabt", "Hufash", "Shibam Kawkaban", "Milhan", "Bani Sa'd", "Al Rujum", "At Tawilah", "Ar Rujum"]
    },
    {
      "name": "Amanat Al Asimah",
      "cities": ["Old City", "As Sabaeen", "Ma'een", "At Tahrir", "Ath Thawrah", "Shu'ub", "As Sab'een", "Bani Al Harith", "Al Wahdah", "Azal"]
    },
    {
      "name": "Amran",
      "cities": ["Amran", "Raydah", "Harf Sufyan", "Kharif", "Al Qaflah", "As Sudah", "Bani Suraim", "Maswar", "Iyal Surayh", "Jabal Iyal Yazid", "Thulla", "Habur Zulaymah", "As Sawd", "Al Madan", "Suwayr", "Shahid Naji", "Dhi Bin"]
    },
    {
      "name": "Dhamar",
      "cities": ["Dhamar", "Ans", "Al Hada", "Mayfa'ah Ans", "Utmah", "Jahran", "Dawran Ans", "Maghirib Ans", "Al Manar", "Wusab As Safil", "Wusab Al Ali", "Jabal Ash Sharq"]
    },
    {
      "name": "Hadhramaut",
      "cities": ["Al Mukalla", "Seiyun", "Ash Shihr", "Tarim", "Shibam", "Wadi Hadhramaut", "Qat'n", "Yabuth", "Hajr As Saiyr", "Do'an", "Huraidhah", "Al Qatn", "Amd", "Rakhyah", "Thamud", "Sayh Al Urr", "Al Abr", "Marib Al Wadi", "Hawrah", "Zamakh wa Manwakh", "Al Wade'a", "Ghayl Ba Wazir", "Hagam", "Mukayras", "Ar Raydah Wa Qusayar", "Ad Dis", "Rummah", "Al Mukalla", "Mukayras", "Al Qa'imah", "As Sawm", "Ar Rawdhah", "Ath Thalooth", "At Tan'im", "Barahut", "Yashbum"]
    },
    {
      "name": "Hajjah",
      "cities": ["Hajjah", "Abs", "Haradh", "Midi", "Mustaba", "Aflah Al Yaman", "Qafl Shamer", "Najrah", "Bakil Al Mir", "Al Jamimah", "Al Miftah", "Ash Shaghadirah", "Washah", "Kuhlan Ash Sharaf", "Ku'aydinah", "Aflah Ash Shawm", "Bani Qays", "Shaharah", "As Salam", "Opinah", "Hajjah Rural", "Aslam", "Laa", "Al Maghrabah", "Ash Shahil", "Kushar"]
    },
    {
      "name": "Ibb",
      "cities": ["Ibb", "Jibla", "Ba'adan", "Hubaysh", "As Sayyani", "Al Mashannah", "As Sabrah", "Mudhaykhirah", "Al Qafr", "Ya'far", "An Nadirah", "Dhi As Sufal", "Al 'Udayn", "Hazm Al 'Udayn", "Far' Al 'Udayn", "As Saddah", "Ash Sha'ir", "Al Makhader", "Ar Radhmat"]
    },
    {
      "name": "Lahij",
      "cities": ["Al Houta", "Tubn", "Halimayn", "Radfan", "Yahr", "Al Wade'a", "Al Qabbaytah", "Al Madaribah Wa Al Arah", "Al Milah", "Al Maqatirah", "Tor Al Bahah", "Yafa'a", "Al Had", "As Said"]
    },
    {
      "name": "Ma'rib",
      "cities": ["Ma'rib", "Sirwah", "Raghwan", "Mahliyah", "Harib", "Al Jubah", "Bidbadah", "Rahabah", "Harib Al Qaramish", "Majzar", "Al Abdiyah", "Medghal", "Jabal Murad", "Rahbah"]
    },
    {
      "name": "Raymah",
      "cities": ["Al Jabin", "Bilad At Ta'am", "Kusmah", "Al Salafiyah", "Mazhar", "As Salafiyah"]
    },
    {
      "name": "Sa'dah",
      "cities": ["Sa'dah", "Haydan", "Kitaf wa Al Boqe'e", "Al Dhaher", "Razih", "Al Hashwah", "Majz", "Sahar", "Kutaf", "As Safra'", "Shada'a", "Qatabir", "Baqim", "Munabbih", "Ghamr", "Saqayn", "Al Buqa'", "Al Boqe'e"]
    },
    {
      "name": "Sana'a",
      "cities": ["Sanhan", "Khawlan", "Bani Matar", "Al Husn", "Jihanah", "Hamdan", "Nihm", "Bani Hashish", "Manakhah", "Hamdaan", "Sa'fan", "Arhab", "At Tyal", "Bilad Ar Rus", "Al Haymah Al Kharijiyah", "Bani Dhabyan"]
    },
    {
      "name": "Shabwah",
      "cities": ["Ataq", "Ar Rawdah", "Mayfa'a", "Nisab", "Merkhah As Sufla", "Merkhah Al Ulya", "Hatib", "Usaylan", "Rudum", "Jardan", "Dhar", "Bayhan", "Ain", "As Said", "Arma", "Al Talh", "Habban"]
    },
    {
      "name": "Socotra",
      "cities": ["Hadibo", "Mumi", "Qalansiyah", "Abd al Kuri"]
    },
    {
      "name": "Taiz",
      "cities": ["Taiz", "Al Turbah", "Sabir Al Mawadim", "Ash Shamayatayn", "Dimnat Khadir", "Al Wazi'iyah", "Shar'ab Ar Ronnah", "Shar'ab As Salam", "Jabal Habashy", "Al Mudhaffar", "Al Qahirah", "Salh", "Maqbanah", "Al Misrakh", "Mawza'", "As Silw", "Sama'", "Al Ma'afer", "Al Makha", "Dhubab", "Barah", "Hayfan", "Mawiyah", "Al Mawasit"]
    }
  ];
  export default governorates;