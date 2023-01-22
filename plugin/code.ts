enum Type {
  COLUMN,
  ROW,
  MODAL,
  IMAGE,
  TEXT,
  BUTTON,
  RECTANGLE,
}

function name(type: Type): string {
  return Type[type];
}

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

interface ComponentBoxImage extends ComponentBoxComponent {
  name: string;
}

function componentBoxButton(node: InstanceNode): ComponentBoxButton {
  const properties = node.componentProperties;
  const propertyKeys = Object.keys(properties);
  const labelKey = propertyKeys.filter((key) => key.startsWith("Label"))[0];

  const label = properties[labelKey].value as string;

  const size = properties["Size"].value as string;

  const onClick = properties["OnClick"].value as string;

  const variant = properties["Variant"].value as string;

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

function componentBoxImage(node: InstanceNode): ComponentBoxImage {
  const name = node.mainComponent?.name as string;
  return {
    name,
    type: Type[Type.IMAGE],
  };
}

const rootComponents = [];

function componentBoxComponent(
  node: SceneNode,
  type: Type
): ComponentBoxComponent {
  switch (type) {
    case Type.BUTTON:
      return componentBoxButton(node as InstanceNode);
    case Type.IMAGE:
      // InstanceNode
      return componentBoxImage(node as InstanceNode);
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
  }
}

function search(node: SceneNode): ComponentBoxComponent {
  const children: ComponentBoxComponent[] = [];
  const type = getType(node);
  const component = componentBoxComponent(node, type);

  const frameNode = node as FrameNode;
  if (frameNode?.children) {
    frameNode.children
      .map((child) => search(child))
      .forEach((child) => children.push(child));
  }
  component.children = children.reverse();
  return component;
}

for (const node of figma.currentPage.selection) {
  const root = search(node);
  console.log(root);
}

function getTypeFromInstanceNode(node: InstanceNode): string {
  const componentNode = node.mainComponent as ComponentNode;
  return getTypeFromComponentNode(componentNode);
}

function getTypeFromComponentNode(node: ComponentNode): string {
  const componentSetNode = node.parent as ComponentSetNode;
  return componentSetNode.name;
}

function getType(node: SceneNode): Type {
  const componentNode = node as ComponentNode;
  const instanceNode = node as InstanceNode;
  const textNode = node as TextNode;
  const rectangleNode = node as RectangleNode;

  if (componentNode) {
    const name = componentNode.name;
    if (name === "Column") return Type.COLUMN;
    if (name === "Rectangle") return Type.RECTANGLE;
    if (name === "Row") return Type.ROW;

    const componentSetNode = componentNode.parent as ComponentSetNode;
    const componentSetNodeName = componentSetNode.name;
    if (componentSetNodeName === "Modal") return Type.MODAL;
  }

  if (instanceNode) {
    const numVectors =
      (node as InstanceNode).mainComponent?.children.filter(
        (child) => child.type === "VECTOR"
      )?.length ?? 0;
    const isImage = numVectors > 0;

    if (isImage) return Type.IMAGE;

    const isButton = instanceNode.name === "Button";
    if (isButton) return Type.BUTTON;
  }

  if (textNode) {
    return Type.TEXT;
  }

  if (rectangleNode) {
    return Type.RECTANGLE;
  }

  return Type.COLUMN;
}

figma.closePlugin();
