// Type

enum Type {
    COLUMN,
    ROW,
    MODAL,
    IMAGE,
    TEXT,
    BUTTON,
    RECTANGLE,
    UNKNOWN,
}

// Component

interface ComponentBoxComponent {
    children?: ComponentBoxComponent[];
    type: string;
}

interface ComponentBoxButton extends ComponentBoxComponent {
    label: string;
    size: string;
    onClick: string;
    variant: string;
    isFullWidth: boolean;
    icon?: string;
}

interface ComponentBoxColumn extends ComponentBoxComponent {
    verticalArrangement: string;
    horizontalAlignment: string;
    fillMaxSize?: boolean;
    fillMaxHeight?: boolean;
    fillMaxWidth?: boolean;
    padding?: string;
    margin?: string;
    background?: string;
    weight?: string;
    height?: string;
    width?: string;
    designVariant: string;
}

interface ComponentBoxImage extends ComponentBoxComponent {
    name: string;
}

// Factory

function ComponentFactory(node: SceneNode, type: Type): ComponentBoxComponent {
    switch (type) {
        case Type.BUTTON:
            return ButtonFactory(node as InstanceNode);
        case Type.IMAGE:
            return ImageFactory(node as InstanceNode);
        case Type.COLUMN:
            return ColumnFactory(node as ComponentNode);
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

function ButtonFactory(node: InstanceNode): ComponentBoxButton {
    const properties = node.componentProperties;
    const propertyKeys = Object.keys(properties);
    const labelKey = propertyKeys.filter((key) => key.startsWith('Label'))[0];

    const label = properties[labelKey].value as string;

    const size = properties['Size'].value as string;

    const onClick = properties['OnClick'].value as string;

    const variant = properties['Variant'].value as string;

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

function ImageFactory(node: InstanceNode): ComponentBoxImage {
    const name = node.mainComponent?.name as string;
    return {
        name,
        type: Type[Type.IMAGE],
    };
}

function ColumnFactory(node: ComponentNode): ComponentBoxColumn {
    const properties = node.variantProperties;
    return {
        verticalArrangement: properties?.['VerticalArrangement'] ?? 'Top',
        horizontalAlignment: properties?.['HorizontalAlignment'] ?? 'Start',
        fillMaxSize: properties?.['FillMaxSize'] == 'True' ?? false,
        fillMaxHeight: properties?.['FillMaxHeight'] == 'True' ?? false,
        fillMaxWidth: properties?.['FillMaxWidth'] == 'True' ?? false,
        padding: properties?.['Padding'] ?? 'null',
        margin: properties?.['Margin'] ?? 'null',
        background: properties?.['Background'] ?? 'null',
        weight: properties?.['Weight'] ?? 'null',
        height: properties?.['Height'] ?? 'null',
        width: properties?.['Width'] ?? 'null',
        type: Type[Type.COLUMN],
        designVariant: properties?.['DesignVariant'] ?? 'null',
    };
}

// Util

function name(type: Type): string {
    return Type[type];
}

// Main

const rootComponents = figma.currentPage.selection.map((node) => search(node));
console.log(rootComponents);
figma.closePlugin();

function search(node: SceneNode): ComponentBoxComponent {
    const children: ComponentBoxComponent[] = [];
    const type = getType(node);
    const component = ComponentFactory(node, type);

    const frameNode = node as FrameNode;
    if (frameNode?.children) {
        frameNode.children.map((child) => search(child)).forEach((child) => children.push(child));
    }
    component.children = children.reverse();
    return component;
}

function getType(node: SceneNode): Type {
    const componentNode = node as ComponentNode;
    const instanceNode = node as InstanceNode;
    const textNode = node as TextNode;
    const rectangleNode = node as RectangleNode;

    if (componentNode) {
        const name = componentNode.name;
        if (name === 'Column') return Type.COLUMN;
        if (name === 'Rectangle') return Type.RECTANGLE;
        if (name === 'Row') return Type.ROW;

        const componentSetNode = componentNode.parent as ComponentSetNode;
        const componentSetNodeName = componentSetNode.name;
        if (componentSetNodeName === 'Modal') return Type.MODAL;
    }

    if (instanceNode) {
        const numVectors = (node as InstanceNode).mainComponent?.children.filter((child) => child.type === 'VECTOR')?.length ?? 0;
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
