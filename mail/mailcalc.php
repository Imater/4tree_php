<?php
require_once('Zend/Mail/Storage/Pop3.php');
/////////////////////////////////////////////// Крон расчета автоматики из писем
$oImap = new Zend_Mail_Storage_Pop3(array('host' => 'mail.4tree.ru',
										 'user'=> '4tree@4tree.ru',
										 'password' => 'uuS4foos_VE'));


//$oImap = new Imap('{mail.example.ua:993/imap/ssl/novalidate-cert/user="robotmail"}', 'robotmail', 'robotpass');

//$oImap = new imap_open('{mail.4tree.ru}', '4tree@4tree.ru', 'uuS4foos_VE');

$aCheck = $oImap->checkMailbox();
if ($aCheck && $aCheck['Nmsgs']) {
    $aListEmail = $oImap->getEmailList();
    // Проход по массиву писем
    foreach ($aListEmail as $iMailId => $aMailData) {
        $aLoadFile = array();
        $aMsgInfo = $oImap->getMsgInfo($aMailData['msgno']);
        $sSender = $aMsgInfo['from'][0]['mailbox'] . '@' . $aMsgInfo['from'][0]['host'];
        echo ' Отправитель: ' . $sSender . ' :: Тема: ' . $aMsgInfo['subject'] . " \n";
        // Защита от автоответчиков
        if (preg_match('/^(Re):.*$/is', $aMsgInfo['subject'])) {
            $oImap->delete($iMailId);
            continue;
        }
        $oImap->fetchBody($iMailId);
        $aEmailAttach = $oImap->getAttach();
        // Удаление картинок вложенных в тело
        foreach ($oImap->getIncMap() as $sIncludeFileName) {
            if (isset($aEmailAttach[$sIncludeFileName])) {
                unset($aEmailAttach[$sIncludeFileName]);
            }
        }
        if (!empty($aEmailAttach)) {
            foreach ($aEmailAttach as $sAttachName => $sValue) {
                $sLoadFile = TMPPATH . '/' . $iMailId . '_' . $sAttachName;
                $rFh = fopen($sLoadFile, 'wb');
                fputs($rFh, $sValue);
                fclose($rFh);

                if (preg_match('/.*?\.zip$/i', $sLoadFile)) {
                    $rZip = zip_open($sLoadFile);
                    if (is_resource($rZip)) {
                        while ($rZipFile = zip_read($rZip)) {
                            $sZipFileName = zip_entry_name($rZipFile);
                            $sZipFilePath = TMPPATH . '/' . $iMailId . '_' . $sZipFileName;
                            $rFh = fopen($sZipFilePath, 'wb');
                            if ($rFh) {
                                while ($sFileData = zip_entry_read($rZipFile)) {
                                    fwrite($rFh, $sFileData);
                                }
                                fclose($rFh);
                                $aLoadFileInfo = pathinfo($sZipFilePath);
                                $aLoadFile[$sZipFilePath] = $aLoadFileInfo;
                            }
                        }
                        zip_close($rZip);
                    } else {
                        //Error open zip
                    }
                    unlink($sLoadFile);     // удаление архива
                } else {
                    $aLoadFileInfo = pathinfo($sLoadFile);
                    $aLoadFile[$sLoadFile] = $aLoadFileInfo;
                }
            } // Проход по массиву вложений

            foreach ($aLoadFile as $sLoadFilePath => $aLoadFileInfo) {
                //
                // Расчет автоматики из файлов
                //
            }
        } else {
            // Нет вложенных файлов
        }

        // Удаление всех временных файлов
        foreach ($aLoadFile as $sLoadFilePath => $aLoadFileInfo) {
            unlink($sLoadFilePath);
        }
        unset($aLoadFile);
        // Удаление письма
        if (IS_LIVE) {
            //$oImap->delete($iMailId);
        }
    } // Проход по массиву писем
} else {
    // ошибки
}
?>
