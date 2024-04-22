package com.lifeplus.lifeleaf.uploader

sealed class UpdateResult
class FileParseError(val cause: Exception) : UpdateResult()
class FileReadError(val cause: Exception) : UpdateResult()
class ConnectionError : UpdateResult()
class CommunicationError(val cause: Exception) : UpdateResult()
class CrcError : UpdateResult()
class InstallationError : UpdateResult()
class Success : UpdateResult()
