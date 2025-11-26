// Export all drag-drop utilities
export {
  DragDropManager,
  DraggableItem,
  DroppableContainer,
  type DragItem,
  type DroppableContainerConfig,
} from './DragDropManager';

export {
  useAttendanceDragDrop,
  type AttendanceDragItem,
} from './useAttendanceDragDrop';

export {
  triggerHaptic,
  isTouchDevice,
  getViewportHeight,
  preventScrollDuringDrag,
  useDetectLongPress,
} from './touch-utils';
