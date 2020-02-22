import { INode } from "../../../nodes/interfaces";

export function is_text_or_mustach(node: INode) {
  return node.type === 'MustacheTag' || node.type === 'Text';
}