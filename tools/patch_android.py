#!/usr/bin/env python3
"""Overlays AzanGo's Kotlin sources onto the Capacitor-generated android/ project. Safe to run repeatedly."""
import json, os, re, shutil, sys

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
# widget layout + provider info
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

# 3b) Tapsell Mediation SDK used by native AzanAds.kt
# The Cordova bridge is a separate legacy plugin; it does not provide the
# ir.tapsell.mediation.* classes used by the native Kotlin implementation.
if "ir.tapsell.mediation:tapsell:1.3.0" not in b:
    b += "\ndependencies {\n    implementation 'ir.tapsell.mediation:tapsell:1.3.0'\n}\n"
    open(ag, "w", encoding="utf-8").write(b)

# 3b) Supply the Tapsell Mediation application key required by its manifest.
# This is the app-level key from the user's Tapsell dashboard; ad-zone IDs stay in AzanAds.kt.
if "TapsellMediationAppKey" not in b:
    tapsell_key = "mkerkacpddbnttkiceabqptdpissipciqmojhhdkceocgbfkcchppfhpmhlemgafodclej"
    b, count = re.subn(
        r"(defaultConfig\s*\{)",
        r"\1\n        manifestPlaceholders += [TapsellMediationAppKey: '" + tapsell_key + "']",
        b,
        count=1,
    )
    if count != 1:
        sys.exit("Could not add TapsellMediationAppKey to android/app/build.gradle")
    open(ag, "w", encoding="utf-8").write(b)

# 3c) Tapsell 1.3.x pulls AndroidX Work 2.10.x, which requires API 35.
# Upgrade AGP/Gradle to a toolchain that officially supports compileSdk 35.
root_gradle = os.path.join(A, "build.gradle")
if os.path.isfile(root_gradle):
    rg_text = open(root_gradle, encoding="utf-8").read()
    rg_text = re.sub(
        r"(com\.android\.tools\.build:gradle:)8\.2\.1",
        r"\g<1>8.6.1",
        rg_text,
    )
    open(root_gradle, "w", encoding="utf-8").write(rg_text)

variables_gradle = os.path.join(A, "variables.gradle")
if os.path.isfile(variables_gradle):
    vg = open(variables_gradle, encoding="utf-8").read()
    vg2, n = re.subn(r"(compileSdkVersion\s*=\s*)\d+", r"\g<1>35", vg, count=1)
    if n == 0:
        vg2, n = re.subn(r"(compileSdkVersion\s+)\d+", r"\\g<1>35", vg, count=1)
    if n:
        open(variables_gradle, "w", encoding="utf-8").write(vg2)
    else:
        sys.exit("Could not set compileSdkVersion 35 in android/variables.gradle")

wrapper = os.path.join(A, "gradle/wrapper/gradle-wrapper.properties")
if os.path.isfile(wrapper):
    wp = open(wrapper, encoding="utf-8").read()
    wp = re.sub(r"gradle-[0-9.]+-(?:all|bin)\.zip", "gradle-8.7-all.zip", wp)
    open(wrapper, "w", encoding="utf-8").write(wp)

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


# 6) Tapsell Cordova compatibility: widen the activity reference before
# checking against TapsellAdActivity. This keeps the Tapsell SDK enabled.
tapsell_java = os.path.join(
    A, "capacitor-cordova-android-plugins/src/main/java/ir/tapsell/sdk/TapsellCordovaInterface.java"
)
if os.path.isfile(tapsell_java):
    t = open(tapsell_java, encoding="utf-8").read()
    for method, callback in (("close", "onClose"), ("dismiss", "onDismiss"), ("replay", "replayVideo")):
        pattern = (
            r"private void " + method +
            r"\(JSONArray args, CallbackContext callbackContext\) throws JSONException\s*\{.*?\n\t\}"
        )
        replacement = (
            "private void " + method + "(JSONArray args, CallbackContext callbackContext) throws JSONException {\n"
            "        Activity activity = cordova == null ? null : cordova.getActivity();\n"
            "        if (activity instanceof TapsellAdActivity) {\n"
            "            ((TapsellAdActivity) activity)." + callback + "();\n"
            "        }\n"
            "    }"
        )
        t, count = re.subn(pattern, replacement, t, count=1, flags=re.S)
        if count != 1:
            print("Warning: could not patch Tapsell method", method)
    open(tapsell_java, "w", encoding="utf-8").write(t)

print("AzanGo native overlay applied for", app_id)
