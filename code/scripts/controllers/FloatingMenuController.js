import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

class FloatingMenuController extends ContainerController {
    constructor(element) {
        super(element);

        const menuItems = [{
            "name": "Main Innovations",
            "path": "products.html",
            "icon": "fa-bars",
            "type": "route",
            "component": "psk-page-loader",
            "exact": true,
            "indexed": true,
            "historyType": "query",
            "componentProps": {
                "pageUrl": "http://localhost:8000/pages/products"
            }
        }];

        this.on("needFloatingItems", (e) => {
            e.stopImmediatePropagation();
            console.log(e);
            if (e.detail) {
                const callback = e.detail;
                if (typeof callback === 'function') {
                    callback(null, menuItems);
                }
            }
        })
    }
}

export default FloatingMenuController;