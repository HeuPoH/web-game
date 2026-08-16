/**
 * Интерфейс для всех сущностей, которые могут быть сериализованы
 * для отправки клиенту в составе ServerPacket или selfPlayerUpdated.
 */
export interface ISerializable<T = unknown> {
  serialize(): T;
}
