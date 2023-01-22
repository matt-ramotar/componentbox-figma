'use strict';
// Type
var Type;
(function (Type) {
    Type[(Type['COLUMN'] = 0)] = 'COLUMN';
    Type[(Type['ROW'] = 1)] = 'ROW';
    Type[(Type['MODAL'] = 2)] = 'MODAL';
    Type[(Type['IMAGE'] = 3)] = 'IMAGE';
    Type[(Type['TEXT'] = 4)] = 'TEXT';
    Type[(Type['BUTTON'] = 5)] = 'BUTTON';
    Type[(Type['RECTANGLE'] = 6)] = 'RECTANGLE';
    Type[(Type['UNKNOWN'] = 7)] = 'UNKNOWN';
    Type[(Type['VECTOR'] = 8)] = 'VECTOR';
})(Type || (Type = {}));
// Factory
function ComponentFactory(node, type) {
    switch (type) {
        case Type.BUTTON:
            return ButtonFactory(node);
        case Type.IMAGE:
            return ImageFactory(node);
        case Type.COLUMN:
            return ColumnFactory(node);
        case Type.RECTANGLE:
            // ComponentNode
            // RectangleNode
            return {
                type: Type[Type.RECTANGLE],
            };
        case Type.MODAL:
            // ComponentNode
            return {
                type: Type[Type.MODAL],
            };
        case Type.TEXT:
            // TextNode
            return {
                type: Type[Type.TEXT],
            };
        case Type.ROW:
            // ComponentNode
            return {
                type: Type[Type.ROW],
            };
        case Type.UNKNOWN:
            return {
                type: Type[Type.UNKNOWN],
            };
        case Type.VECTOR:
            return {
                type: Type[Type.VECTOR],
            };
    }
}
function ButtonFactory(node) {
    const properties = node.componentProperties;
    const propertyKeys = Object.keys(properties);
    const labelKey = propertyKeys.filter((key) => key.startsWith('Label'))[0];
    const label = properties[labelKey].value;
    const size = properties['Size'].value;
    const onClick = properties['OnClick'].value;
    const variant = properties['Variant'].value;
    const isFullWidth = true;
    return {
        label,
        size,
        onClick,
        variant,
        isFullWidth,
        type: Type[Type.BUTTON],
    };
}
function ImageFactory(node) {
    var _a;
    const name = (_a = node.mainComponent) === null || _a === void 0 ? void 0 : _a.name;
    return {
        name,
        type: Type[Type.IMAGE],
    };
}
function ColumnFactory(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const properties = node.variantProperties;
    return {
        verticalArrangement:
            (_a = properties === null || properties === void 0 ? void 0 : properties['VerticalArrangement']) !== null && _a !== void 0 ? _a : 'Top',
        horizontalAlignment:
            (_b = properties === null || properties === void 0 ? void 0 : properties['HorizontalAlignment']) !== null && _b !== void 0 ? _b : 'Start',
        fillMaxSize:
            (_c = (properties === null || properties === void 0 ? void 0 : properties['FillMaxSize']) == 'True') !== null && _c !== void 0 ? _c : false,
        fillMaxHeight:
            (_d = (properties === null || properties === void 0 ? void 0 : properties['FillMaxHeight']) == 'True') !== null && _d !== void 0 ? _d : false,
        fillMaxWidth:
            (_e = (properties === null || properties === void 0 ? void 0 : properties['FillMaxWidth']) == 'True') !== null && _e !== void 0 ? _e : false,
        padding: (_f = properties === null || properties === void 0 ? void 0 : properties['Padding']) !== null && _f !== void 0 ? _f : 'null',
        margin: (_g = properties === null || properties === void 0 ? void 0 : properties['Margin']) !== null && _g !== void 0 ? _g : 'null',
        background: (_h = properties === null || properties === void 0 ? void 0 : properties['Background']) !== null && _h !== void 0 ? _h : 'null',
        weight: (_j = properties === null || properties === void 0 ? void 0 : properties['Weight']) !== null && _j !== void 0 ? _j : 'null',
        height: (_k = properties === null || properties === void 0 ? void 0 : properties['Height']) !== null && _k !== void 0 ? _k : 'null',
        width: (_l = properties === null || properties === void 0 ? void 0 : properties['Width']) !== null && _l !== void 0 ? _l : 'null',
        type: Type[Type.COLUMN],
        designVariant: (_m = properties === null || properties === void 0 ? void 0 : properties['DesignVariant']) !== null && _m !== void 0 ? _m : 'null',
    };
}
// Util
function name(type) {
    return Type[type];
}
// Main
const rootComponents = figma.currentPage.selection.map((node) => search(node));
const json = JSON.stringify(rootComponents);
console.log(json);
figma.closePlugin();
function search(node) {
    const children = [];
    const type = getType(node);
    const component = ComponentFactory(node, type);
    const frameNode = node;
    if (frameNode === null || frameNode === void 0 ? void 0 : frameNode.children) {
        frameNode.children.map((child) => search(child)).forEach((child) => children.push(child));
    }
    component.children = children.reverse();
    return component;
}
function getType(node) {
    var _a, _b, _c;
    const isComponentNode = node.type === 'COMPONENT';
    const isInstanceNode = node.type === 'INSTANCE';
    const isTextNode = node.type === 'TEXT';
    const isRectangleNode = node.type === 'RECTANGLE';
    const isVectorNode = node.type === 'VECTOR';
    if (isComponentNode) {
        const componentNode = node;
        const name = componentNode.name;
        if (name === 'Rectangle') return Type.RECTANGLE;
        if (name === 'Row') return Type.ROW;
        const componentSetNode = componentNode.parent;
        const componentSetNodeName = componentSetNode.name;
        if (componentSetNodeName === 'Modal') return Type.MODAL;
    }
    if (isInstanceNode) {
        const instanceNode = node;
        if (instanceNode.name == 'Column') return Type.COLUMN;
        const numVectors =
            (_c =
                (_b = (_a = instanceNode.mainComponent) === null || _a === void 0 ? void 0 : _a.children.filter((child) => child.type === 'VECTOR')) === null ||
                _b === void 0
                    ? void 0
                    : _b.length) !== null && _c !== void 0
                ? _c
                : 0;
        const isImage = numVectors > 0;
        if (isImage) return Type.IMAGE;
        const isButton = instanceNode.name === 'Button';
        if (isButton) return Type.BUTTON;
    }
    if (isVectorNode) {
        return Type.VECTOR;
    }
    if (isTextNode) {
        return Type.TEXT;
    }
    if (isRectangleNode) {
        return Type.RECTANGLE;
    }
    return Type.UNKNOWN;
}
