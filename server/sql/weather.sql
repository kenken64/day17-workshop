CREATE TABLE IF NOT EXISTS `weather` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=126 ;

INSERT INTO `weather` (`id`, `country`, `city`, `modified_date`, `created_date`, `is_deleted`) VALUES (1, 'MY', 'Kuala Lumpur', '2016-07-26 00:00:00', '2016-07-26 00:00:00', 0);
INSERT INTO `weather` (`id`, `country`, `city`, `modified_date`, `created_date`, `is_deleted`) VALUES (2, 'GB', 'London', '2016-07-26 00:00:00', '2016-07-26 00:00:00', 0);
INSERT INTO `weather` (`id`, `country`, `city`, `modified_date`, `created_date`, `is_deleted`) VALUES (3, 'TH', 'Bangkok', '2016-07-26 00:00:00', '2016-07-26 00:00:00', 0);
INSERT INTO `weather` (`id`, `country`, `city`, `modified_date`, `created_date`, `is_deleted`) VALUES (4, 'SG', 'Singapore', '2016-07-26 00:00:00', '2016-07-26 00:00:00', 0);