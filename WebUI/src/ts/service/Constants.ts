export class Constants {

    static readonly isDev = import.meta.env.DEV

    static readonly isProd = !Constants.isDev

    static readonly userLanguage = navigator.language

}
