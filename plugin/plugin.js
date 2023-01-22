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
})(Type || (Type = {}));
// Factory
function ComponentFactory(node, type) {
    switch (type) {
        case Type.BUTTON:
            return ButtonFactory(node);
        case Type.IMAGE:
            // InstanceNode
            return ImageFactory(node);
        case Type.COLUMN:
            // ComponentNode
            return {
                type: Type[Type.COLUMN],
            };
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
// Util
function name(type) {
    return Type[type];
}
// Main
const rootComponents = figma.currentPage.selection.map((node) => search(node));
console.log(rootComponents);
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
    const componentNode = node;
    const instanceNode = node;
    const textNode = node;
    const rectangleNode = node;
    if (componentNode) {
        const name = componentNode.name;
        if (name === 'Column') return Type.COLUMN;
        if (name === 'Rectangle') return Type.RECTANGLE;
        if (name === 'Row') return Type.ROW;
        const componentSetNode = componentNode.parent;
        const componentSetNodeName = componentSetNode.name;
        if (componentSetNodeName === 'Modal') return Type.MODAL;
    }
    if (instanceNode) {
        const numVectors =
            (_c =
                (_b = (_a = node.mainComponent) === null || _a === void 0 ? void 0 : _a.children.filter((child) => child.type === 'VECTOR')) === null ||
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
    if (textNode) {
        return Type.TEXT;
    }
    if (rectangleNode) {
        return Type.RECTANGLE;
    }
    return Type.UNKNOWN;
}
