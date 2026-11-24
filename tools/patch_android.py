#!/usr/bin/env python3
"""Overlays AzanGo's Kotlin sources onto the Capacitor-generated android/ project. Safe to run repeatedly."""
import json, os, re, shutil, sys

# ════════════════════════════════════════════════════════════════════════════
# تبلیغات تپسل — بنر بومی + بنر استاندارد درون‌محتوایی (از نسخهٔ ۲.۲.۱)
#
# ✅ شناسه اپلیکیشن (App Key) تپسل از نسخه ۲.۱.۱ وارد شده است؛ دیگر نیازی به
#    کار دستی نیست. اگر روزی خواستید کلید را عوض کنید، همین خط پایین را ویرایش
#    کنید و یک‌بار دیگر اجرا کنید:
#
#        python3 tools/patch_android.py && npx cap sync android
#
#    فضاهای تبلیغاتی (Zone IDs) داخل فایل native/kotlin/AzanAds.kt تنظیم شده‌اند.
# ════════════════════════════════════════════════════════════════════════════
TAPSELL_APP_KEY = "mkerkacpddbnttkiceabqptdpissipciqmojhhdkceocgbfkcchppfhpmhlemgafodclej"
TAPSELL_VERSION = "2.3.3"

# ابزارهای اندروید — SDK تپسل به androidx.work:2.10.5 وابسته است که compileSdk 35 می‌خواهد؛
# قالب Capacitor با compileSdk 34 و AGP 8.2.1 می‌آید و بیلد روی checkAarMetadata می‌شکند.
AGP_VERSION = "8.7.3"     # Android Gradle Plugin — از 8.6 به بالا از compileSdk 35 پشتیبانی می‌کند
GRADLE_VERSION = "8.9"    # حداقل Gradle لازم برای AGP 8.7
COMPILE_SDK = 35          # compileSdk لازم برای androidx.work 2.10.5 (targetSdk همان 34 می‌ماند)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "android")
if not os.path.isdir(A):
    sys.exit("android/ not found. Run: npx cap add android")

app_id = json.load(open(os.path.join(ROOT, "capacitor.config.json")))["appId"]
pkg_dir = os.path.join(A, "app/src/main/java", *app_id.split("."))
os.makedirs(pkg_dir, exist_ok=True)

# 1) Kotlin sources (replace Java MainActivity)
for f in os.listdir(os.path.join(ROOT, "native/kotlin")):
    if f.endswith(".kt"):
        txt = open(os.path.join(ROOT, "native/kotlin", f), encoding="utf-8").read()
        for old_pkg in ("ir.azango.app", "com.ofoqshari.bz"):
            txt = txt.replace("package " + old_pkg, "package " + app_id).replace(old_pkg + ".", app_id + ".")
        open(os.path.join(pkg_dir, f), "w", encoding="utf-8").write(txt)
# built-in azan audio -> res/raw
raw_src = os.path.join(ROOT, "native/res/raw")
if os.path.isdir(raw_src):
    raw_dst = os.path.join(A, "app/src/main/res/raw")
    os.makedirs(raw_dst, exist_ok=True)
    for f in os.listdir(raw_src):
        shutil.copy2(os.path.join(raw_src, f), os.path.join(raw_dst, f))
# widget layouts + their drawable shapes (wgt_bg, wgt_chip, ...) + provider info
for sub in ("layout", "xml", "drawable"):
    src = os.path.join(ROOT, "native/res", sub)
    if not os.path.isdir(src):
        continue
    dst = os.path.join(A, "app/src/main/res", sub)
    os.makedirs(dst, exist_ok=True)
    for f in os.listdir(src):
        if f.endswith(".xml"):
            shutil.copy2(os.path.join(src, f), os.path.join(dst, f))

java_main = os.path.join(pkg_dir, "MainActivity.java")
if os.path.exists(java_main):
    os.remove(java_main)

# 2) AndroidManifest.xml
mp = os.path.join(A, "app/src/main/AndroidManifest.xml")
m = open(mp, encoding="utf-8").read()
if "AzanReceiver" not in m:
    perms = open(os.path.join(ROOT, "native/manifest_permissions.xml"), encoding="utf-8").read()
    comps = open(os.path.join(ROOT, "native/manifest_components.xml"), encoding="utf-8").read().replace("ir.azango.app.", app_id + ".").replace("com.ofoqshari.bz.", app_id + ".")
    m = m.replace("</application>", comps + "    </application>", 1)
    m = m.replace("</manifest>", perms + "</manifest>", 1)
    m = m.replace("<application", '<application android:supportsRtl="true"', 1) if "supportsRtl" not in m else m
    open(mp, "w", encoding="utf-8").write(m)
else:
    # پروژهٔ از قبل پچ‌شده: مجوزهای لازم تپسل را در صورت نبودن اضافه کن
    extra = ""
    if "com.google.android.gms.permission.AD_ID" not in m:
        extra += '    <uses-permission android:name="com.google.android.gms.permission.AD_ID" />\n'
    if "android.permission.INTERNET" not in m:
        extra += '    <uses-permission android:name="android.permission.INTERNET" />\n'
    if "android.permission.ACCESS_NETWORK_STATE" not in m:
        extra += '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n'
    if extra:
        m = m.replace("</manifest>", extra + "</manifest>", 1)
        open(mp, "w", encoding="utf-8").write(m)

# 2b) کلید تپسل به‌صورت متادیتای مستقیم در مانیفست — علاوه بر manifestPlaceholder.
#     SDK تپسل کلید را از متادیتای «ir.tapsell.mediation.APPLICATION_KEY» می‌خواند؛
#     تزریق مستقل از مکانیزم placeholder باعث می‌شود حتی اگر جایگزینی placeholder
#     در build.gradle انجام نشده باشد، کلید حتماً در APK باشد (نسخه ۲.۱.۵).
mp = os.path.join(A, "app/src/main/AndroidManifest.xml")
m = open(mp, encoding="utf-8").read()
if "ir.tapsell.mediation.APPLICATION_KEY" not in m:
    meta = ('    <meta-data\n'
            '        android:name="ir.tapsell.mediation.APPLICATION_KEY"\n'
            '        android:value="' + TAPSELL_APP_KEY + '" />\n')
    m = m.replace("</application>", meta + "</application>", 1)
    open(mp, "w", encoding="utf-8").write(m)
    print("Tapsell App Key meta-data injected into AndroidManifest.xml")
else:
    m2 = re.sub(r'(android:name="ir\.tapsell\.mediation\.APPLICATION_KEY"[^>]*android:value=")[^"]*(")',
                r"\g<1>" + TAPSELL_APP_KEY + r"\2", m, flags=re.S)
    if m2 != m:
        open(mp, "w", encoding="utf-8").write(m2)
        print("Tapsell App Key meta-data updated in AndroidManifest.xml")

# 3) Gradle: enable Kotlin
rg = os.path.join(A, "build.gradle")
g = open(rg, encoding="utf-8").read()
if "kotlin-gradle-plugin" not in g:
    g, n = re.subn(r"(\n\s*classpath\s+['\"]com\.android\.tools\.build:gradle:[^'\"]+['\"])",
                   r"\1\n        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22'", g, count=1)
    if n == 0:
        sys.exit("Could not patch android/build.gradle - add the Kotlin classpath manually (see README).")
    open(rg, "w", encoding="utf-8").write(g)

ag = os.path.join(A, "app/build.gradle")
b = open(ag, encoding="utf-8").read()
if "kotlin-android" not in b:
    b = re.sub(r"(apply plugin:\s*['\"]com\.android\.application['\"])", r"\1\napply plugin: 'kotlin-android'", b, count=1)
    b += "\nandroid {\n    kotlinOptions { jvmTarget = '17' }\n}\n"
    open(ag, "w", encoding="utf-8").write(b)

# 4) App name
sp = os.path.join(A, "app/src/main/res/values/strings.xml")
if os.path.exists(sp):
    s = open(sp, encoding="utf-8").read()
    s = re.sub(r'(<string name="app_name">)[^<]*(</string>)', r"\1افق شرعی\2", s)
    s = re.sub(r'(<string name="title_activity_main">)[^<]*(</string>)', r"\1افق شرعی\2", s)
    open(sp, "w", encoding="utf-8").write(s)

# 5) App icon — copy prebuilt mipmaps only (never write colors into colors.xml;
# Capacitor already ships values/ic_launcher_background.xml)
res_root = os.path.join(A, "app/src/main/res")
icon_copied = 0
native_res = os.path.join(ROOT, "native/res")
for name in os.listdir(native_res):
    src_dir = os.path.join(native_res, name)
    if not os.path.isdir(src_dir) or not name.startswith("mipmap-"):
        continue
    dst_dir = os.path.join(res_root, name)
    os.makedirs(dst_dir, exist_ok=True)
    for f in os.listdir(src_dir):
        if f.endswith((".png", ".xml", ".webp")):
            shutil.copy2(os.path.join(src_dir, f), os.path.join(dst_dir, f))
            icon_copied += 1

# Update Capacitor's existing launcher background color (avoid duplicate resource)
bg_candidates = [
    os.path.join(res_root, "values", "ic_launcher_background.xml"),
    os.path.join(res_root, "values", "colors.xml"),
]
for bg in bg_candidates:
    if not os.path.isfile(bg):
        continue
    txt = open(bg, encoding="utf-8").read()
    if "ic_launcher_background" in txt:
        txt2 = re.sub(
            r'(<color\s+name="ic_launcher_background">)[^<]*(</color>)',
            r"\1#0A3D2E\2",
            txt,
        )
        if txt2 != txt:
            open(bg, "w", encoding="utf-8").write(txt2)
            print("Updated ic_launcher_background color in", os.path.basename(bg))
        break
else:
    # only create if Capacitor did not provide one
    values = os.path.join(res_root, "values")
    os.makedirs(values, exist_ok=True)
    open(os.path.join(values, "ic_launcher_background.xml"), "w", encoding="utf-8").write(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<resources>\n'
        '    <color name="ic_launcher_background">#0A3D2E</color>\n'
        '</resources>\n'
    )

# Remove Capacitor default webp launchers so our PNGs are used
for folder, _, files in os.walk(res_root):
    if not os.path.basename(folder).startswith("mipmap-"):
        continue
    for f in files:
        if f.startswith("ic_launcher") and f.endswith(".webp"):
            try:
                os.remove(os.path.join(folder, f))
            except OSError:
                pass

if icon_copied:
    print("App icon applied (%d mipmap files)" % icon_copied)
else:
    print("Warning: no prebuilt icons found under native/res/mipmap-*")

# 6) Tapsell Plus SDK — zone IDs from the Tapsell Plus dashboard.
ag = os.path.join(A, "app/build.gradle")
b = open(ag, encoding="utf-8").read()

# Remove legacy Mediation artifacts/placeholders if a generated template contains them.
b = re.sub(r'^\s*implementation\s+["\']ir\.tapsell\.mediation(?::[^"\']+)["\']\s*\n',
           '', b, flags=re.M)
b = re.sub(r'^\s*manifestPlaceholders\s*\+=\s*\[TapsellMediationAppKey:[^\n]+\n',
           '', b, flags=re.M)

dependency = "implementation 'ir.tapsell.plus:tapsell-plus-sdk-android:" + TAPSELL_VERSION + "'"
if "ir.tapsell.plus:tapsell-plus-sdk-android" not in b:
    if "dependencies {" in b:
        b = b.replace("dependencies {", "dependencies {\n    " + dependency, 1)
    else:
        b += "\n\ndependencies {\n    " + dependency + "\n}\n"

open(ag, "w", encoding="utf-8").write(b)
print("Tapsell Plus SDK applied:", app_id, "(SDK " + TAPSELL_VERSION + ")")

# 7) ارتقای ابزارهای اندروید — برای androidx.work:2.10.5 (وابستگی تپسل) compileSdk 35 لازم است.
#    AGP/Gradle/compileSdk قالب Capacitor به‌طور خودکار بالا می‌بریم (idempotent).
def _ver(s):
    return tuple(int(x) for x in s.split(".") if x.isdigit())

# 7a) Android Gradle Plugin در android/build.gradle
bg = os.path.join(A, "build.gradle")
g = open(bg, encoding="utf-8").read()
mg = re.search(r"com\.android\.tools\.build:gradle:([\d.]+)", g)
if mg:
    cur = mg.group(1).rstrip(".")
    if _ver(cur) < _ver(AGP_VERSION):
        g = g.replace("com.android.tools.build:gradle:" + cur,
                      "com.android.tools.build:gradle:" + AGP_VERSION)
        open(bg, "w", encoding="utf-8").write(g)
        print("AGP upgraded:", cur, "->", AGP_VERSION)
    else:
        print("AGP already", cur)
else:
    print("Warning: AGP classpath not found in android/build.gradle — upgrade manually to", AGP_VERSION)

# 7b) Gradle wrapper (gradle-wrapper.properties)
wp = os.path.join(A, "gradle", "wrapper", "gradle-wrapper.properties")
if os.path.isfile(wp):
    w = open(wp, encoding="utf-8").read()
    mw = re.search(r"gradle-([\d.]+)-(bin|all)\.zip", w)
    if mw:
        cur = mw.group(1)
        if _ver(cur) < _ver(GRADLE_VERSION):
            w = w.replace("gradle-" + cur + "-" + mw.group(2) + ".zip",
                          "gradle-" + GRADLE_VERSION + "-" + mw.group(2) + ".zip")
            open(wp, "w", encoding="utf-8").write(w)
            print("Gradle wrapper upgraded:", cur, "->", GRADLE_VERSION)
        else:
            print("Gradle wrapper already", cur)

# 7c) compileSdkVersion در variables.gradle (قالب Capacitor) یا مستقیماً در app/build.gradle
vfile = os.path.join(A, "variables.gradle")
bumped = False
if os.path.isfile(vfile):
    v = open(vfile, encoding="utf-8").read()
    v2 = re.sub(r"(compileSdkVersion\s*:\s*)(\d+)",
                lambda m: m.group(1) + str(COMPILE_SDK) if int(m.group(2)) < COMPILE_SDK else m.group(0),
                v)
    v2 = re.sub(r"(compileSdkVersion\s*=\s*)(\d+)",
                lambda m: m.group(1) + str(COMPILE_SDK) if int(m.group(2)) < COMPILE_SDK else m.group(0),
                v2)
    if v2 != v:
        open(vfile, "w", encoding="utf-8").write(v2)
        print("compileSdkVersion bumped to", COMPILE_SDK, "(variables.gradle)")
        bumped = True
if not bumped:
    b = open(ag, encoding="utf-8").read()
    b2 = re.sub(r"(compileSdk(?:Version)?\s+)(\d+)",
                lambda m: m.group(1) + str(COMPILE_SDK) if int(m.group(2)) < COMPILE_SDK else m.group(0),
                b, count=1)
    if b2 != b:
        open(ag, "w", encoding="utf-8").write(b2)
        print("compileSdk bumped to", COMPILE_SDK, "(app/build.gradle)")

print("AzanGo native overlay applied for", app_id)
