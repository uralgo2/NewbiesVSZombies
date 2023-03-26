export class Page {
    private static _m_history: string[] = []
    private static _m_currentRoute: string = 'mainMenu'
    private static DEFAULT_PATH: string = 'inGameUI'
    private static _m_root: HTMLElement
    public static Init(root: string){
        this._m_root = document.querySelector(root)!
    }

    public static NavigateTo(to: string){
        this._m_history.push(this._m_currentRoute)

        this._m_currentRoute = to

        this.ReRender()
    }

    public static Back(){
        this._m_currentRoute = this._m_history.pop() || this.DEFAULT_PATH

        this.ReRender()
    }

    private static ReRender() {
        for (let child of this._m_root.children) {
            child.classList.add('hidden')
        }

        this._m_root.querySelector(`#${this._m_currentRoute}`)!
            .classList.remove('hidden')
    }
}