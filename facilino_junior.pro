TEMPLATE = subdirs
SUBDIRS = ts src
TRANSLATIONS = \
    ts/facilino_junior_ca-es.ts \
    ts/facilino_junior_es-es.ts

macx {
    deploy.commands = macdeployqt $${OUT_PWD}/FacilinoJunior.app
    QMAKE_EXTRA_TARGETS += deploy
}

win32 {
    RC_ICONS = facilino_junior.ico
    deploy.commands = windeployqt --release $${OUT_PWD}/src/FacilinoJunior.exe
    QMAKE_EXTRA_TARGETS += deploy
}

win64 {
    RC_ICONS = facilino_junior.ico
    deploy.commands = windeployqt --release $${OUT_PWD}/src/FacilinoJunior.exe
    QMAKE_EXTRA_TARGETS += deploy
}
