<?php

/**
 * Работа с почтовым ящиком Imap
 *
 * @example
 * $oImap = new Imap('{pop.ua.fm:110/pop3}', 'myemail@ua.fm', 'mypass');
 * $aBoxList = $oImap->getBoxList('{pop.ua.fm:110/pop3}');
 * $aCheck = $oImap->checkMailbox();
 * if ($aCheck) {
 *     $iMsgNum = $oImap->num_msg();
 *     $iUid = $oImap->uid(3);
 *     $aListEmail = $oImap->getEmailList();
 *     foreach ($aListEmail as $iUid => $aValue) {
 *         $aMsgInfo = $oImap->getMsgInfo($aValue['msgno']);
 *         if (preg_match('/^(Re):.*$/is', $aMsgInfo['subject'])) {
 *             $oImap->delete($iUid);
 *             continue;
 *         }
 *         $oImap->fetchBody($iUid);
 *         $aEmailText = $oImap->getText();
 *         $aEmailInc = $oImap->getIncMap();
 *         $aEmailAttach = $oImap->getAttach();
 *         foreach ($aEmailAttach as $sName => $sValue) {
 *             file_put_contents('makedir/' . $sName, $sValue);
 *         }
 *     }
 * }
 * $aError = $oImap->getError();
 *
 * @category    Alt
 * @package     Alt_Imap
 * @author      Gordon Freeman <toxa82@gmail.com>
 * @copyright   Copyright (c) 2012+ Gordon Freeman
 * @license     New BSD License
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright notice, this list
 *   of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this
 *   list of conditions and the following disclaimer in the documentation and/or
 *   other materials provided with the distribution.
 * - Neither the name of the Gordon Freeman nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without specific
 *   prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @version     $Id:1.0 {Imap.php} {07.05.2012} {23:16:56} altermann $
 */
class Alt_Imap
{

    /**
     * Ресурс соединения
     * @var resource
     * @access protected
     */
    protected $rMail;

    /**
     * Строка коннекта к ящику
     * @var string
     * @access protected
     */
    protected $sConnect;

    /**
     * Кодировка в письмах по-умолчанию
     * @var string
     * @access protected
     */
    protected $sCharsetIn;

    /**
     * Выходная кодировка текста [windows-1251]
     * @var string
     * @access protected
     */
    protected $sCharsetOut = 'windows-1251';

    /**
     * Данные проверки состояния
     * @var stdClass
     * @access protected
     */
    protected $oCheck;

    /**
     * Информация о текущих сообщений в ящике
     * @var array В списке с полной информацией ключем массива является uid, в краткой - порядковый номер
     * @access protected
     */
    protected $aMailListInfo = array();

    /**
     * Текст из письма
     * @var array
     * @access protected
     */
    protected $aMailText = array();

    /**
     * Приложения из письма
     * @var array
     * @access protected
     */
    protected $aMailAttach = array();

    /**
     * Связка id и имени файла из письма
     * @var array
     * @access protected
     */
    protected $aMailInc = array();

    /**
     * Список поддерживаемых mime-типов
     * @var array
     * @access protected
     */
    protected $aMimeType = array(
        0 => 'text',
        1 => 'multipart',
        2 => 'message',
        3 => 'application',
        4 => 'audio',
        5 => 'image',
        6 => 'video',
        7 => 'other',
    );

    /**
     * Список поддерживаемых кодировок сообщения
     * @var array
     * @access protected
     */
    protected $aEncoding  = array(
        0 => '7bit',
        1 => '8bit',
        2 => 'binary',
        3 => 'base64',
        4 => 'quoted-printable',
        5 => 'other',
    );

    /**
     * Создание экземпляра класса и подключение к почтовому серверу
     *
     * @param string $sConnect Строка подключения
     * @param string $sLogin Логин
     * @param string $sPass Пароль
     * @param int $iOption Дополнительные опции подключения [NIL]
     * @param int $iRetry Кол-во попыток подключения [0]
     * @access public
     */
    public function __construct($sConnect, $sLogin, $sPass, $iOption = NIL, $iRetry = 0)
    {
        $this->sConnect = $sConnect;
        $this->rMail = @imap_open($sConnect, $sLogin, $sPass, $iOption, $iRetry);
    }

    /**
     * Получение списка почтовых ящиков
     *
     * @param string $sPattern Паттерн выбора почтовых ящиков [*]
     * @return array
     * @access public
     */
    public function getBoxList($sPattern = '*')
    {
        if ($this->rMail) {
            imap_errors();
            return imap_list($this->rMail, $this->sConnect, $sPattern);
        } else {
            return false;
        }
    }

    /**
     * Проверка и получение информации о состоянии почтового ящика
     *
     * @return array|bool (Unread, Deleted, Nmsgs, Size, Date, Driver, Mailbox, Recent)
     * или false в случае ошибки подключения
     * @access public
     */
    public function checkMailbox()
    {
        if ($this->rMail) {
            $aData = array();
            $this->oCheck = imap_mailboxmsginfo($this->rMail);
            foreach ($this->oCheck as $sKey => $sVal) {
                $aData[$sKey] = $sVal;
            }
            return $aData;
        } else {
            return false;
        }
    }

    /**
     * Получение списка сообщений в почтовом ящике <br/>
     * В списке с полной информацией ключем массива является uid, в краткой - порядковый номер
     *
     * @param bool $bFullInfo Получить полную информацию о письмах [true]
     * @return array uid=>(subject,from,to,date,message_id,size,uid,msgno,recent,flagged,answered,deleted,seen,draft,udate)
     * @access public
     */
    public function getEmailList($bFullInfo = true)
    {
        $this->aMailListInfo = array();
        if ($bFullInfo) {
            $aEmailList = imap_fetch_overview($this->rMail, '1:' . imap_num_msg($this->rMail));
            foreach ($aEmailList as $iKey => $oVal) {
                $this->aMailListInfo[$oVal->uid] = $this->decodeHeader($oVal);
            }
        } else {
            $aEmailList = imap_headers($this->rMail);
            foreach ($aEmailList as $iKey => $sVal) {
                $this->aMailListInfo[$iKey + 1] = $sVal;
            }
        }

        return $this->aMailListInfo;
    }

    /**
     * Получение основной информации о сообщении
     *
     * @param int $iNum Порядковый номер сообщения в ящике
     * @return array
     * @access public
     */
    public function getMsgInfo($iNum)
    {
        $oMsgHead = imap_headerinfo($this->rMail, $iNum);
        return $this->decodeHeader($oMsgHead);
    }

    /**
     * Получение текста сообщения
     *
     * @param int $iMsgUid ID сообщения
     * @return array
     * @access public
     */
    public function fetchBody($iMsgUid)
    {
        $this->aMailText = $this->aMailAttach = $this->aMailInc = array();
        $oStructure = imap_fetchstructure($this->rMail, $iMsgUid, FT_UID);
        if ($oStructure) {
            if (!empty($oStructure->parts) && is_array($oStructure->parts)) {
                // Тип мултипарт, раскручиваем части
                foreach ($oStructure->parts as $iKey => $oVal) {
                    $this->getPart($oVal, $iMsgUid, $iKey + 1);
                }
            } else {
                $this->getPart($oStructure, $iMsgUid);
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Получение данных из частей письма
     *
     * @param stdClass $oStructure Инфо о структуре email-части
     * @param int $iMsgUid ID сообщения
     * @param int|string $mPart Номер части email
     * @return void
     * @access protected
     */
    protected function getPart(stdClass $oStructure, $iMsgUid, $mPart = 0)
    {
        $mPart = ($mPart == 0 ? 1 : $mPart);
        $sText = imap_fetchbody($this->rMail, $iMsgUid, $mPart, FT_UID);
        if ($sText) {
            if ($oStructure->type == 0)  { // Тип text, получаем текст
                $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
            } elseif ($oStructure->type == 1) { // Тип multipart
                if (!empty($oStructure->parts) && is_array($oStructure->parts)) {
                    // Раскручиваем части
                    foreach ($oStructure->parts as $iKey => $oVal) {
                        $iKey += 1;
                        $mPartSub = ($mPart == 0 ? $iKey : ($mPart . '.' . $iKey));
                        $this->getPart($oVal, $iMsgUid, $mPartSub);
                    }
                }
            } elseif ($oStructure->type == 2)  { // Тип message
                // Получаем текст
                $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
//                if (!empty($oStructure->parts) && is_array($oStructure->parts)) {
//                    foreach ($oStructure->parts as $iKey => $oVal) {
//                        $this->getPart($oVal, $iMsgUid, ($mPart . '.' . $iKey + 1));
//                    }
//                }
            } elseif ($oStructure->ifid)  { // Встроенные элементы в html
                if ($oStructure->type == 5 && $oStructure->ifparameters) {
                    // Получаем картинки встроенные в HTML письмо
                    $this->getFile($oStructure, $sText);
                }
            } elseif ($oStructure->ifdisposition) {
                if (strcasecmp($oStructure->disposition, 'attachment') == 0) {
                    // Получаем вложенный файл
                    $this->getFile($oStructure, $sText);
                } elseif (strcasecmp($oStructure->disposition, 'inline') == 0) {
                    // Получаем вложенный файл или текст
                    if (!$this->getFile($oStructure, $sText)) {
                        // Получаем текст
                        $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
                    }
                }
            } else {
                $this->aMailText[] = trim($this->decodeBody($sText, $oStructure));
            }
        }
    }

    /**
     * Получение файла из текста письма
     *
     * @param stdClass $oStructure Инфо о структуре email-части
     * @param string $sText Текст email-части
     * @return boolean
     */
    protected function getFile(stdClass $oStructure, $sText)
    {
        if ($oStructure->ifdparameters) {
            $sFileName = $this->decodeHeader($oStructure->dparameters[0]->value);
        } elseif ($oStructure->ifparameters) {
            $sFileName = $this->decodeHeader($oStructure->parameters[0]->value);
        }
        if (!empty($sFileName)) {
            $this->aMailAttach[$sFileName] = $this->decodeBody($sText, $oStructure);
            if ($oStructure->ifid) {
                $sId = strtr($oStructure->id, array('<' => '', '>' => ''));
                $this->aMailInc[$sId] = $sFileName;
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Отправка письма
     *
     * @return bool
     * @access public
     */
    public function send()
    {
        $aEnvelope['from'] = 'a.falalieiev@ecocontrol.com.ua';
        $aEnvelope['to'] = 'toxa82@gmail.com';
        $aEnvelope['subject'] = 'newmail';
        //$aEnvelope['cc'] = 'bar@example.com';

        $aPart1['type'] = TYPEMULTIPART;
        $aPart1['subtype'] = 'mixed';

        $sFilename = 'rec.txt';
        $fp = fopen($sFilename, 'r');
        $sContents = fread($fp, filesize($sFilename));
        fclose($fp);

        $aPart2['type'] = TYPEAPPLICATION;
        $aPart2['encoding'] = ENCBINARY;
        $aPart2['subtype'] = 'octet-stream';
        $aPart2['filename'] = $sFilename;
        $aPart2['description'] = basename($sFilename);
        $aPart2['contents.data'] = $sContents;

        $aPart3['type'] = TYPETEXT;
        $aPart3['subtype'] = 'plain';
        $aPart3['description'] = 'description3';
        $aPart3['contents.data'] = 'contents.data3\n\n\n\t';

        $aBody[1] = $aPart1;
        $aBody[2] = $aPart2;
        $aBody[3] = $aPart3;

        echo nl2br(imap_mail_compose($aEnvelope, $aBody));
        //imap_expunge();
        //imap_reopen($this->rMail, '{pop.ua.fm:110/pop3}');
        //imap_append($this->rMail, '{mail.ecocontrol.com.ua:993/imap/ssl/novalidate-cert/user="a.falalieiev@ecocontrol.com.ua"}INBOX.Sent', imap_mail_compose($aEnvelope, $aBody));
    }

    /**
     * Удаление сообщения
     *
     * @param int $iMsgUid ID сообщения
     * @param bool $bNow Применить удаление сразу [false]
     * @return bool
     * @access public
     */
    public function delete($iMsgUid, $bNow = false)
    {
        $bDel = imap_delete($this->rMail, $iMsgUid, FT_UID);
        if ($bNow && $bDel) {
            return imap_expunge($this->rMail);
        } else {
            return $bDel;
        }
    }

    /**
     * Декодирование информации из заголовков сообщения вида:<br/>
     * =?KOI8-R?B?0tXT08vJyi5jc3Y=?=
     *
     * @param array|string $mValue Закодированная строка
     * @return string Раскодированная строка
     * @access protected
     */
    protected function decodeHeader($mValue)
    {
        $aReturn = array();
        if (is_array($mValue) || $mValue instanceof stdClass) {
            foreach ($mValue as $sKey => $mVal) {
                $aReturn[$sKey] = $this->decodeHeader($mVal);
            }
            return $aReturn;
        } elseif (is_int($mValue)) {
            return $mValue;
        } else {
            $iKey = 0;
            $aData = imap_mime_header_decode($mValue);
            $aDataOut = array();
            foreach ($aData as $oValue) {
                if (empty($sCharset) || $sCharset != $oValue->charset) {
                    $sCharset = $oValue->charset;
                    $iKey++;
                }
                $aDataOut[$iKey] = array(
                    'charset' => $sCharset,
                    'text' => (isset($aDataOut[$iKey]['text']) ? $aDataOut[$iKey]['text'] : '') . $oValue->text,
                );
            }
            $aRet = array();
            foreach ($aDataOut as $aValue) {
                $aRet[] = $this->iconvCharset($aValue['text'], $aValue['charset']);
            }
            return trim(implode('', $aRet));
        }
    }

    /**
     * Декодирование текста с учетом кодировки
     *
     * @param string $sText Декодируемый текст
     * @param stdClass $oStructure Инфо о структуре email-части
     * @return string
     * @access protected
     */
	protected function decodeBody($sText, stdClass $oStructure)
    {
        switch ($oStructure->encoding) {
            case 0:
            case 1:
                $sText = imap_8bit($sText);
                $sText = imap_qprint($sText);
                break;

            case 2:
                $sText = imap_binary($sText);
                break;

            case 3:
            default:
                $sText = imap_base64($sText);
                break;

            case 4:
                $sText = imap_qprint($sText);
                break;
        }
        if ($oStructure->ifparameters) {
            foreach ($oStructure->parameters as $oVal) {
                if (strcasecmp($oVal->attribute, 'charset') == 0) {
                    $sText = $this->iconvCharset($sText, $oVal->value);
                    continue;
                }
            }
        }
        return $sText;
    }

    /**
     * Перекодировка текста из одной кодировки в другую
     *
     * @param string $sText Текст для перекодирования
     * @param string $sCharset Кодировка
     * @return string
     * @access protected
     */
    protected function iconvCharset($sText, $sCharset)
    {
        $sCharset = strtolower($sCharset);
        if (!empty($this->sCharsetIn) && strcasecmp($sCharset, 'default') == 0) {
            $sCharset = $this->sCharsetIn;
        }
        if ($sCharset !== $this->sCharsetOut && strcasecmp($sCharset, 'default') != 0
            &&  strcasecmp($sCharset, 'x-unknown') != 0) {
            $sText = iconv($sCharset, $this->sCharsetOut, $sText);
        }
        return $sText;
    }

    /**
     * Получение MIME типа
     *
     * @param stdClass $oStructure Инфо о структуре email или его части
     * @return string
     * @access protected
     */
	protected function getMimeType(stdClass $oStructure)
    {
        if ($oStructure->ifsubtype) {
            $sMimeType = $this->aMimeType[(int)$oStructure->type] . '/' . strtolower($oStructure->subtype);
        } else {
            $sMimeType = $this->aMimeType[(int)$oStructure->type];
        }
        return $sMimeType;
    }

    /**
     * Получение всего текста из письма
     *
     * @return array
     * @access public
     */
    public function getText()
    {
        return $this->aMailText;
    }

    /**
     * Получение связки id аттача к имени файла
     *
     * @return array
     * @access public
     */
    public function getIncMap()
    {
        return $this->aMailInc;
    }

    /**
     * Получение вложений из письма
     *
     * @return array
     * @access public
     */
    public function getAttach()
    {
        return $this->aMailAttach;
    }

    /**
     * Получение значения текущей выходной кодировки
     *
     * @return string
     * @access public
     */
    public function getCharsetOut()
    {
        return $this->sCharsetOut;
    }

    /**
     * Установка значения текущей выходной кодировки
     *
     * @param string $sCharsetOut Кодировка текста на выходе
     * @return Alt_Imap
     * @access public
     */
    public function setCharsetOut($sCharsetOut)
    {
        $this->sCharsetOut = $sCharsetOut;
        return $this;
    }

    /**
     * Установка значения кодировки писем по умолчанию вместо default
     *
     * @param string $sCharsetIn Кодировка
     * @return Alt_Imap
     * @access public
     */
    public function setCharsetDefault($sCharsetIn)
    {
        $this->sCharsetIn = $sCharsetIn;
        return $this;
    }

    /**
     * Функция вызова стандартных функций IMAP. Добавляет первым аргументом imap-ресурс
     *
     * @param string $sFunction Название функции без imap_
     * @param array $aArguments Параметры функции
     * @return mixed
     * @access public
     */
    public function __call($sFunction, $aArguments)
    {
        $sFunction = 'imap_' . strtolower($sFunction);
        if (function_exists($sFunction)) {
            array_unshift($aArguments, $this->rMail);
            return call_user_func_array($sFunction, $aArguments);
        }
    }

    /**
     * Получение списка ошибок
     *
     * @return array|bool
     * @access public
     */
    public function getError()
    {
        return imap_errors();
    }

    /**
     * Закрытие подключения к почте
     *
     * @access public
     */
    public function __destruct()
    {
        if (is_resource($this->rMail)) {
            imap_errors();
            imap_close($this->rMail, CL_EXPUNGE);
        }
    }

}

