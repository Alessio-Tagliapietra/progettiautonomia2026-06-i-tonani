
-- -----------------------------------------------------
-- Table `Users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Users` ;

CREATE TABLE IF NOT EXISTS `Users` (
  `nick` VARCHAR(20) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`nick`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Post`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Post` ;

CREATE TABLE IF NOT EXISTS `Post` (
  `idPost` INT NOT NULL AUTO_INCREMENT,
  `url` MEDIUMBLOB NOT NULL,
  `descrizione` VARCHAR(256) NULL,
  `usersNick` VARCHAR(20) NOT NULL,
  `dataPubblicazione` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`idPost`),
  INDEX `fk_Post_Users_idx` (`usersNick` ASC) VISIBLE,
  CONSTRAINT `fk_Post_Users`
    FOREIGN KEY (`usersNick`)
    REFERENCES `Users` (`nick`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)


-- -----------------------------------------------------
-- Table `Likes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Likes` ;

CREATE TABLE IF NOT EXISTS `Likes` (
  `Users_nick` VARCHAR(20) NOT NULL,
  `Post_idPost` INT NOT NULL,
  PRIMARY KEY (`Users_nick`, `Post_idPost`),
  INDEX `fk_Users_has_Post_Post1_idx` (`Post_idPost` ASC) VISIBLE,
  INDEX `fk_Users_has_Post_Users1_idx` (`Users_nick` ASC) VISIBLE,
  CONSTRAINT `fk_Users_has_Post_Users1`
    FOREIGN KEY (`Users_nick`)
    REFERENCES `Users` (`nick`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_has_Post_Post1`
    FOREIGN KEY (`Post_idPost`)
    REFERENCES `Post` (`idPost`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
